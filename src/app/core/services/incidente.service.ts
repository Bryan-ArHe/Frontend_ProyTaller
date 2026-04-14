import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncidenteRequest, IncidenteResponse } from '../models/incidente.model';

@Injectable({
  providedIn: 'root',
})
export class IncidenteService {
  private readonly baseUrl = 'http://localhost:8000/api/incidentes';

  constructor(private readonly http: HttpClient) {}

  /**
   * Reporta un nuevo incidente/emergencia
   */
  reportarIncidente(data: IncidenteRequest): Observable<IncidenteResponse> {
    return this.http.post<IncidenteResponse>(`${this.baseUrl}/crear`, data);
  }

  /**
   * Obtiene el historial de incidentes del usuario
   */
  getMisIncidentes(): Observable<IncidenteResponse[]> {
    return this.http.get<IncidenteResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene un incidente específico
   */
  getIncidente(id: number): Observable<IncidenteResponse> {
    return this.http.get<IncidenteResponse>(`${this.baseUrl}/${id}`);
  }
}
