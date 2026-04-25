import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bitacora } from '../models/bitacora.model';

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private apiUrl = `${environment.apiUrl}/bitacora`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los registros de bitácora con filtros opcionales
   * @param evento - Filtrar por tipo de evento (LOGIN, CREATE, UPDATE, DELETE, READ, LOGOUT)
   * @param userId - Filtrar por ID de usuario
   */
  getLogs(evento?: string, userId?: number): Observable<Bitacora[]> {
    let params = new HttpParams();
    if (evento) params = params.set('evento', evento);
    if (userId) params = params.set('id_usuario', userId.toString());

    return this.http.get<Bitacora[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene registros de bitácora filtrados por usuario
   * @param userId - ID del usuario
   */
  getLogsByUser(userId: number): Observable<Bitacora[]> {
    return this.http.get<Bitacora[]>(`${this.apiUrl}/usuario/${userId}`);
  }

  /**
   * Obtiene registros de bitácora filtrados por recurso
   * @param recurso - Nombre del recurso
   */
  getLogsByRecurso(recurso: string): Observable<Bitacora[]> {
    let params = new HttpParams().set('recurso', recurso);
    return this.http.get<Bitacora[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene registros de bitácora filtrados por rango de fechas
   * @param fechaInicio - Fecha de inicio (ISO string)
   * @param fechaFin - Fecha de fin (ISO string)
   */
  getLogsByDateRange(fechaInicio: string, fechaFin: string): Observable<Bitacora[]> {
    let params = new HttpParams().set('fecha_inicio', fechaInicio).set('fecha_fin', fechaFin);
    return this.http.get<Bitacora[]>(this.apiUrl, { params });
  }

  /**
   * Registra una acción en la bitácora
   * Este método es llamado automáticamente por el interceptor HTTP
   * @param accionData - Datos de la acción a registrar
   */
  registrarAccion(accionData: {
    evento: string;
    recurso: string;
    accion: string;
    ip: string;
    endpoint: string;
    payload?: string;
    dispositivo?: string;
    codigo_estado?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, accionData);
  }
}
