import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UbicacionTracking,
  UbicacionTrackingRequest,
  UbicacionTrackingResponse,
} from '../models/tracking.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl(): string {
    return `${this.config.getApiUrl()}/tracking`;
  }

  /**
   * Obtiene todas las ubicaciones de tracking
   */
  getTrackings(): Observable<UbicacionTrackingResponse[]> {
    return this.http.get<UbicacionTrackingResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene el tracking de un técnico
   */
  getTrackingByTecnico(idTecnico: number): Observable<UbicacionTrackingResponse[]> {
    return this.http.get<UbicacionTrackingResponse[]>(`${this.baseUrl}?tecnico=${idTecnico}`);
  }

  /**
   * Obtiene la última ubicación de un técnico
   */
  getUltimaUbicacionTecnico(idTecnico: number): Observable<UbicacionTrackingResponse> {
    return this.http.get<UbicacionTrackingResponse>(`${this.baseUrl}/tecnico/${idTecnico}/ultima`);
  }

  /**
   * Registra una nueva ubicación
   */
  registrarUbicacion(data: UbicacionTrackingRequest): Observable<UbicacionTrackingResponse> {
    return this.http.post<UbicacionTrackingResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Actualiza la ubicación en tiempo real
   */
  actualizarUbicacion(
    idTecnico: number,
    data: UbicacionTrackingRequest,
  ): Observable<UbicacionTrackingResponse> {
    return this.http.post<UbicacionTrackingResponse>(`${this.baseUrl}/${idTecnico}`, data);
  }
}
