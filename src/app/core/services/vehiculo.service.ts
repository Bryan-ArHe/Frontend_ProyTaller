import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Marca, Modelo, VehiculoRequest, VehiculoResponse } from '../models/vehiculo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly baseUrl = `${environment.apiUrl}/api/vehiculos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los vehículos del usuario logueado
   */
  getMisVehiculos(): Observable<VehiculoResponse[]> {
    return this.http
      .get<VehiculoResponse[]>(`${this.baseUrl}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cargando vehículos', error),
        ),
      );
  }

  /**
   * Crea un nuevo vehículo
   */
  crearVehiculo(data: VehiculoRequest): Observable<VehiculoResponse> {
    return this.http
      .post<VehiculoResponse>(`${this.baseUrl}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('Error creando vehículo', error)),
      );
  }

  /**
   * Obtiene todas las marcas disponibles
   */
  getMarcas(): Observable<Marca[]> {
    return this.http
      .get<Marca[]>(`${this.baseUrl}/marcas`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('Error cargando marcas', error)),
      );
  }

  /**
   * Obtiene los modelos de una marca específica
   */
  getModelosByMarca(idMarca: number): Observable<Modelo[]> {
    return this.http
      .get<Modelo[]>(`${this.baseUrl}/marcas/${idMarca}/modelos`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('Error cargando modelos', error)),
      );
  }

  /**
   * Obtiene un vehículo por ID
   */
  getVehiculo(id: number): Observable<VehiculoResponse> {
    return this.http
      .get<VehiculoResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cargando vehículo', error),
        ),
      );
  }

  /**
   * Elimina un vehículo
   */
  eliminarVehiculo(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error eliminando vehículo', error),
        ),
      );
  }

  /**
   * Manejo centralizado de errores
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
