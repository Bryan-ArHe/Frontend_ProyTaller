import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SolicitudServicio,
  SolicitudServicioRequest,
  SolicitudServicioUpdate,
  SolicitudServicioResponse,
} from '../models/solicitud.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private readonly baseUrl = `${environment.apiUrl}/api/solicitudes`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todas las solicitudes
   */
  getSolicitudes(): Observable<SolicitudServicioResponse[]> {
    return this.http.get<SolicitudServicioResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene una solicitud por ID
   */
  getSolicitud(id: number): Observable<SolicitudServicioResponse> {
    return this.http.get<SolicitudServicioResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene solicitudes por técnico
   */
  getSolicitudesByTecnico(idTecnico: number): Observable<SolicitudServicioResponse[]> {
    return this.http.get<SolicitudServicioResponse[]>(`${this.baseUrl}?tecnico=${idTecnico}`);
  }

  /**
   * Obtiene solicitudes por incidente
   */
  getSolicitudesByIncidente(idIncidente: number): Observable<SolicitudServicioResponse[]> {
    return this.http.get<SolicitudServicioResponse[]>(`${this.baseUrl}?incidente=${idIncidente}`);
  }

  /**
   * Crea una nueva solicitud de servicio
   */
  crearSolicitud(data: SolicitudServicioRequest): Observable<SolicitudServicioResponse> {
    return this.http.post<SolicitudServicioResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Actualiza una solicitud
   */
  actualizarSolicitud(
    id: number,
    data: SolicitudServicioUpdate,
  ): Observable<SolicitudServicioResponse> {
    return this.http.put<SolicitudServicioResponse>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Elimina una solicitud
   */
  eliminarSolicitud(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
