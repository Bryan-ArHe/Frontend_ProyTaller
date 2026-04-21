import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Comision,
  ComisionRequest,
  ComisionResponse,
  Calificacion,
  CalificacionRequest,
  CalificacionResponse,
} from '../models/comision.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComisionService {
  private readonly baseUrlComision = `${environment.apiUrl}/comisiones`;
  private readonly baseUrlCalificacion = `${environment.apiUrl}/calificaciones`;

  constructor(private readonly http: HttpClient) {}

  // ==================== COMISIONES ====================

  /**
   * Obtiene todas las comisiones
   */
  getComisiones(): Observable<ComisionResponse[]> {
    return this.http.get<ComisionResponse[]>(`${this.baseUrlComision}`);
  }

  /**
   * Obtiene una comisión por ID
   */
  getComision(id: number): Observable<ComisionResponse> {
    return this.http.get<ComisionResponse>(`${this.baseUrlComision}/${id}`);
  }

  /**
   * Obtiene comisiones por pago
   */
  getComisionesByPago(idPago: number): Observable<ComisionResponse[]> {
    return this.http.get<ComisionResponse[]>(`${this.baseUrlComision}?pago=${idPago}`);
  }

  /**
   * Crea una nueva comisión
   */
  crearComision(data: ComisionRequest): Observable<ComisionResponse> {
    return this.http.post<ComisionResponse>(`${this.baseUrlComision}`, data);
  }

  // ==================== CALIFICACIONES ====================

  /**
   * Obtiene todas las calificaciones
   */
  getCalificaciones(): Observable<CalificacionResponse[]> {
    return this.http.get<CalificacionResponse[]>(`${this.baseUrlCalificacion}`);
  }

  /**
   * Obtiene una calificación por ID
   */
  getCalificacion(id: number): Observable<CalificacionResponse> {
    return this.http.get<CalificacionResponse>(`${this.baseUrlCalificacion}/${id}`);
  }

  /**
   * Obtiene calificación por solicitud
   */
  getCalificacionBySolicitud(idSolicitud: number): Observable<CalificacionResponse> {
    return this.http.get<CalificacionResponse>(
      `${this.baseUrlCalificacion}?solicitud=${idSolicitud}`,
    );
  }

  /**
   * Crea una nueva calificación
   */
  crearCalificacion(data: CalificacionRequest): Observable<CalificacionResponse> {
    return this.http.post<CalificacionResponse>(`${this.baseUrlCalificacion}`, data);
  }

  /**
   * Actualiza una calificación
   */
  actualizarCalificacion(
    id: number,
    data: Partial<CalificacionRequest>,
  ): Observable<CalificacionResponse> {
    return this.http.put<CalificacionResponse>(`${this.baseUrlCalificacion}/${id}`, data);
  }
}
