import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotificacionPush,
  NotificacionPushRequest,
  NotificacionPushUpdate,
  NotificacionPushResponse,
} from '../models/notificacion.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl(): string {
    return `${this.config.getApiUrl()}/notificaciones`;
  }

  /**
   * Obtiene todas las notificaciones del usuario
   */
  getNotificaciones(): Observable<NotificacionPushResponse[]> {
    return this.http.get<NotificacionPushResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene una notificación por ID
   */
  getNotificacion(id: number): Observable<NotificacionPushResponse> {
    return this.http.get<NotificacionPushResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene notificaciones no leídas
   */
  getNotificacionesNoLeidas(): Observable<NotificacionPushResponse[]> {
    return this.http.get<NotificacionPushResponse[]>(`${this.baseUrl}?no_leidas=true`);
  }

  /**
   * Envía una notificación
   */
  enviarNotificacion(data: NotificacionPushRequest): Observable<NotificacionPushResponse> {
    return this.http.post<NotificacionPushResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(id: number): Observable<NotificacionPushResponse> {
    return this.http.put<NotificacionPushResponse>(`${this.baseUrl}/${id}`, {
      es_leida: true,
    });
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/marcar-todas-leidas`, {});
  }

  /**
   * Elimina una notificación
   */
  eliminarNotificacion(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
