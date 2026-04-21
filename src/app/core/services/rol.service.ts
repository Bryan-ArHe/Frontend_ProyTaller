import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Rol, Permiso } from '../models/auth.model';

interface ActualizarPermisosRolData {
  permisos_ids: number[]; // array de id_permiso
}

/**
 * Servicio para gestionar Roles y Permisos
 * Proporciona métodos para obtener roles, permisos y actualizar asignaciones
 */
@Injectable({
  providedIn: 'root',
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  /**
   * Obtiene todos los roles disponibles
   */
  getRoles(): Observable<Rol[]> {
    return this.http
      .get<Rol[]>(`${this.baseUrl}`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('Error obteniendo roles', error)),
      );
  }

  /**
   * Obtiene todos los permisos disponibles en el sistema
   */
  getPermisos(): Observable<Permiso[]> {
    return this.http
      .get<Permiso[]>(`${this.baseUrl}/permisos`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error obteniendo permisos', error),
        ),
      );
  }

  /**
   * Actualiza los permisos asignados a un rol
   * @param idRol - ID del rol
   * @param data - Array de IDs de permisos a asignar
   */
  actualizarPermisosDeRol(idRol: number, data: ActualizarPermisosRolData): Observable<Rol> {
    return this.http
      .put<Rol>(`${this.baseUrl}/${idRol}/permisos`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error actualizando permisos del rol', error),
        ),
      );
  }

  /**
   * Maneja errores HTTP y retorna un objeto tipado
   */
  private handleError(mensaje: string, error: HttpErrorResponse): Observable<never> {
    const errorObj = {
      mensaje,
      status: error.status,
      detalle: error.error?.detail || error.statusText,
    };
    console.error(`❌ ${mensaje}:`, errorObj);
    return throwError(() => errorObj);
  }
}
