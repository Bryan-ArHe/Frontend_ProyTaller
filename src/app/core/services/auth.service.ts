import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LoginData, TokenResponse, UsuarioCreate, UsuarioResponse } from '../models/auth.model';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'access_token';

  private readonly userSubject = new BehaviorSubject<UsuarioResponse | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl(): string {
    return `${this.config.getApiUrl()}/auth`;
  }

  login(data: LoginData): Observable<UsuarioResponse> {
    // 🌟 LIMPIEZA PREVENTIVA: Vaciamos el estado anterior en memoria antes de la petición
    this.userSubject.next(null);
    localStorage.removeItem('usuario_rol');
    localStorage.removeItem('usuario_nombre');

    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);

    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, formData).pipe(
      tap((res) => this.setToken(res.access_token)),
      switchMap(() => this.me()), // Consume el nuevo perfil limpio del Gestor
      catchError((error: HttpErrorResponse) => this.handleError('Error en login', error)),
    );
  }

  register(data: UsuarioCreate): Observable<UsuarioResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/register`, data).pipe(
      tap((res) => this.setToken(res.access_token)),
      switchMap(() => this.me()),
      catchError((error: HttpErrorResponse) => this.handleError('Error en registro', error)),
    );
  }

  me(): Observable<UsuarioResponse> {
    return this.http.get<any>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        if (user) {
          // 🌟 Forzamos a Angular a estampar los datos reales del JSON en caliente
          const rolFinal = user.rol_nombre || 'Gestor';
          
          localStorage.setItem('usuario_rol', rolFinal);
          localStorage.setItem('usuario_nombre', user.nombre || 'Gestor');
          
          // Actualizamos el BehaviorSubject para que todo el Front se entere del cambio
          this.userSubject.next(user);
        }
      }),
      catchError((error: HttpErrorResponse) => this.handleError('Error obteniendo usuario', error)),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_rol');
    this.userSubject.next(null);
    void this.router.navigate(['/auth/login']); // 🌟 Asegura la subruta si tu módulo usa /auth/login
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey) ?? localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UsuarioResponse | null {
    return this.userSubject.value;
  }

  private setToken(token: string): void {
    // Limpiamos selectivamente antes de estampar el nuevo JWT
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('token');

    sessionStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('token', token);
  }

  private handleError(mensaje: string, error: HttpErrorResponse) {
    console.error(`${mensaje}:`, error);
    return throwError(() => ({
      mensaje,
      status: error.status,
      detalle: error.error?.detail || error.message,
    }));
  }
}
