import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IncidenteRequest, IncidenteResponse } from '../models/incidente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IncidenteService {
  private readonly baseUrl = `${environment.apiUrl}/api/incidentes`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Reporta un nuevo incidente/emergencia
   */
  reportarIncidente(data: IncidenteRequest): Observable<IncidenteResponse> {
    return this.http
      .post<IncidenteResponse>(`${this.baseUrl}/crear`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error al reportar incidente', error),
        ),
      );
  }

  /**
   * Obtiene el historial de incidentes del usuario
   */
  getMisIncidentes(): Observable<IncidenteResponse[]> {
    return this.http
      .get<IncidenteResponse[]>(`${this.baseUrl}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cargando historial de incidentes', error),
        ),
      );
  }

  /**
   * Obtiene un incidente específico
   */
  getIncidente(id: number): Observable<IncidenteResponse> {
    return this.http
      .get<IncidenteResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('Error cargando incidente', error),
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
