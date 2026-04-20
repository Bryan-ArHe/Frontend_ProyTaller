import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  UsuarioPerfil,
  ActualizarPerfilData,
  CambiarPasswordData,
  UsuarioListado,
  CambiarEstadoUsuarioData,
  AsignarRolData,
  ListadoUsuariosResponse,
  UsuarioResponse,
} from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/api/usuarios`;
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  // ==================== MI PERFIL ====================

  /**
   * Obtiene el perfil del usuario autenticado
   */
  getMiPerfil(): Observable<UsuarioPerfil> {
    return this.http
      .get<UsuarioPerfil>(`${this.authUrl}/me`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error obteniendo tu perfil', error),
        ),
      );
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  actualizarMiPerfil(data: ActualizarPerfilData): Observable<UsuarioPerfil> {
    return this.http
      .put<UsuarioPerfil>(`${this.authUrl}/me`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error actualizando tu perfil', error),
        ),
      );
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  cambiarPassword(data: CambiarPasswordData): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.authUrl}/cambiar-password`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cambiando contraseña', error),
        ),
      );
  }

  // ==================== GESTIÓN DE USUARIOS (ADMIN) ====================

  /**
   * Obtiene el listado de todos los usuarios (solo admin)
   */
  getTodosLosUsuarios(
    pagina: number = 1,
    porPagina: number = 50,
  ): Observable<ListadoUsuariosResponse> {
    return this.http
      .get<ListadoUsuariosResponse>(`${this.baseUrl}?pagina=${pagina}&por_pagina=${porPagina}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cargando usuarios', error),
        ),
      );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuario(id: number): Observable<UsuarioPerfil> {
    return this.http
      .get<UsuarioPerfil>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('Error cargando usuario', error)),
      );
  }

  /**
   * Cambia el estado de un usuario (ACTIVO/BLOQUEADO/INACTIVO)
   */
  cambiarEstadoUsuario(
    idUsuario: number,
    data: CambiarEstadoUsuarioData,
  ): Observable<UsuarioPerfil> {
    return this.http
      .patch<UsuarioPerfil>(`${this.baseUrl}/${idUsuario}/estado`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cambiando estado del usuario', error),
        ),
      );
  }

  /**
   * Asigna un rol a un usuario
   */
  asignarRol(idUsuario: number, data: AsignarRolData): Observable<UsuarioPerfil> {
    return this.http
      .patch<UsuarioPerfil>(`${this.baseUrl}/${idUsuario}/rol`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('Error asignando rol', error)),
      );
  }

  /**
   * Elimina un usuario (solo admin)
   */
  eliminarUsuario(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error eliminando usuario', error),
        ),
      );
  }

  // ==================== UTILIDADES ====================

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(mensaje: string, error: HttpErrorResponse) {
    console.error(`${mensaje}:`, error);
    return throwError(() => ({
      mensaje,
      status: error.status,
      detalle: error.error?.detail || error.message,
    }));
  }
}
