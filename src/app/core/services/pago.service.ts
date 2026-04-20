import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago, PagoRequest, PagoUpdate, PagoResponse } from '../models/pago.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly baseUrl = `${environment.apiUrl}/api/pagos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los pagos
   */
  getPagos(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene un pago por ID
   */
  getPago(id: number): Observable<PagoResponse> {
    return this.http.get<PagoResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene pagos por solicitud
   */
  getPagosBySolicitud(idSolicitud: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.baseUrl}?solicitud=${idSolicitud}`);
  }

  /**
   * Crea un nuevo pago
   */
  crearPago(data: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Actualiza un pago
   */
  actualizarPago(id: number, data: PagoUpdate): Observable<PagoResponse> {
    return this.http.put<PagoResponse>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Procesa un pago
   */
  procesarPago(id: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/${id}/procesar`, {});
  }

  /**
   * Cancela un pago
   */
  cancelarPago(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}
