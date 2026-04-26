import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
import { UsuarioCreate, UsuarioUpdate } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  // ✅ URL SIN /api - el backend NO tiene ese prefijo
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  // ==================== MI PERFIL ====================

  /**
   * Obtiene el perfil del usuario autenticado
   * GET /usuarios/me
   */
  getMiPerfil(): Observable<UsuarioPerfil> {
    return this.http
      .get<UsuarioPerfil>(`${this.baseUrl}/me`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error obteniendo tu perfil', error),
        ),
      );
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * PUT /usuarios/me
   */
  actualizarMiPerfil(data: ActualizarPerfilData): Observable<UsuarioPerfil> {
    return this.http
      .put<UsuarioPerfil>(`${this.baseUrl}/me`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error actualizando tu perfil', error),
        ),
      );
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * PUT /usuarios/me
   * Envía la contraseña actual y la nueva contraseña
   */
  cambiarPassword(data: CambiarPasswordData): Observable<UsuarioPerfil> {
    return this.http
      .put<UsuarioPerfil>(`${this.baseUrl}/me`, {
        password_actual: data.password_actual,
        password_nueva: data.password_nueva,
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cambiando contraseña', error),
        ),
      );
  }

  // ==================== GESTIÓN DE USUARIOS (ADMIN) ====================

  /**
   * Obtiene el listado de todos los usuarios (solo admin)
   * GET /usuarios/
   *
   * El backend devuelve un array directo, se mapea a la estructura paginada
   */
  getTodosLosUsuarios(): Observable<ListadoUsuariosResponse> {
    return this.http.get<UsuarioListado[]>(`${this.baseUrl}/`).pipe(
      // Mapear el array a la estructura { usuarios: [...], total: number }
      map((usuarios) => ({
        usuarios,
        total: usuarios.length,
      })),
      catchError((error: HttpErrorResponse) => this.handleError('Error cargando usuarios', error)),
    );
  }

  /**
   * Crea un nuevo usuario (solo admin)
   * POST /usuarios/
   */
  crearUsuario(data: UsuarioCreate): Observable<UsuarioPerfil> {
    return this.http
      .post<UsuarioPerfil>(`${this.baseUrl}/`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error creando usuario', error),
        ),
      );
  }

  /**
   * Actualiza un usuario existente (solo admin)
   * PUT /usuarios/{id}
   */
  actualizarUsuario(idUsuario: number, data: UsuarioUpdate): Observable<UsuarioPerfil> {
    return this.http
      .put<UsuarioPerfil>(`${this.baseUrl}/${idUsuario}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error actualizando usuario', error),
        ),
      );
  }

  /**
   * Cambia el estado de un usuario (ACTIVO/INACTIVO)
   * PATCH /usuarios/{id}/estado
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
   * PATCH /usuarios/{id}/rol
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
   * DELETE /usuarios/{id}
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
