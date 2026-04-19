import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LoginData, TokenResponse, UsuarioCreate, UsuarioResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'access_token';

  private readonly userSubject = new BehaviorSubject<UsuarioResponse | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(data: LoginData): Observable<UsuarioResponse> {
    // El backend espera email, no username
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/login`, {
        email: data.email,
        password: data.password,
      })
      .pipe(
        tap((res) => this.setToken(res.access_token)),
        switchMap(() => this.me()),
        catchError((error: HttpErrorResponse) => this.handleError('Error en login', error)),
      );
  }

  register(data: UsuarioCreate): Observable<UsuarioResponse> {
    return this.http
      .post<UsuarioResponse>(`${this.baseUrl}/register`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('Error en registro', error)));
  }

  me(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.baseUrl}/me`).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((error: HttpErrorResponse) => this.handleError('Error obteniendo usuario', error)),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    void this.router.navigate(['/login']);
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
    sessionStorage.setItem(this.tokenKey, token);
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
