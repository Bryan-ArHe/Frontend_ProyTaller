import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GestorTaller,
  GestorTallerCreate,
  GestorTallerUpdate,
  GestorTallerResponse,
} from '../models/taller.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TallerService {
  private readonly baseUrl = `${environment.apiUrl}/api/talleres`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los talleres
   */
  getTalleres(): Observable<GestorTallerResponse[]> {
    return this.http.get<GestorTallerResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene un taller por ID
   */
  getTaller(id: number): Observable<GestorTallerResponse> {
    return this.http.get<GestorTallerResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo taller
   */
  crearTaller(data: GestorTallerCreate): Observable<GestorTallerResponse> {
    return this.http.post<GestorTallerResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Actualiza un taller
   */
  actualizarTaller(id: number, data: GestorTallerUpdate): Observable<GestorTallerResponse> {
    return this.http.put<GestorTallerResponse>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Elimina un taller
   */
  eliminarTaller(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
