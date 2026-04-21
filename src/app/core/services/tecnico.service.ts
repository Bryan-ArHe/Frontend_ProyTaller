import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tecnico, TecnicoCreate, TecnicoUpdate, TecnicoResponse } from '../models/tecnico.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TecnicoService {
  private readonly baseUrl = `${environment.apiUrl}/tecnicos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los técnicos
   */
  getTechnicos(): Observable<TecnicoResponse[]> {
    return this.http.get<TecnicoResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene técnicos de un taller específico
   */
  getTecnicosByTaller(idTaller: number): Observable<TecnicoResponse[]> {
    return this.http.get<TecnicoResponse[]>(`${this.baseUrl}?taller=${idTaller}`);
  }

  /**
   * Obtiene un técnico por ID
   */
  getTecnico(id: number): Observable<TecnicoResponse> {
    return this.http.get<TecnicoResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene técnicos disponibles
   */
  getTecnicosDisponibles(): Observable<TecnicoResponse[]> {
    return this.http.get<TecnicoResponse[]>(`${this.baseUrl}?disponible=true`);
  }

  /**
   * Crea un nuevo técnico
   */
  crearTecnico(data: TecnicoCreate): Observable<TecnicoResponse> {
    return this.http.post<TecnicoResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Actualiza un técnico
   */
  actualizarTecnico(id: number, data: TecnicoUpdate): Observable<TecnicoResponse> {
    return this.http.put<TecnicoResponse>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Cambia la disponibilidad de un técnico
   */
  cambiarDisponibilidad(id: number, disponible: boolean): Observable<TecnicoResponse> {
    return this.http.patch<TecnicoResponse>(`${this.baseUrl}/${id}/disponibilidad`, {
      esta_disponible: disponible,
    });
  }

  /**
   * Elimina un técnico
   */
  eliminarTecnico(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
