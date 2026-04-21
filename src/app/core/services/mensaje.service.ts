import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeInApp, MensajeInAppRequest, MensajeInAppResponse } from '../models/mensaje.model';

@Injectable({
  providedIn: 'root',
})
export class MensajeService {
  private readonly baseUrl = 'http://localhost:8000/mensajes';

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los mensajes
   */
  getMensajes(): Observable<MensajeInAppResponse[]> {
    return this.http.get<MensajeInAppResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Obtiene un mensaje por ID
   */
  getMensaje(id: number): Observable<MensajeInAppResponse> {
    return this.http.get<MensajeInAppResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene mensajes de una solicitud
   */
  getMensajesBySolicitud(idSolicitud: number): Observable<MensajeInAppResponse[]> {
    return this.http.get<MensajeInAppResponse[]>(`${this.baseUrl}?solicitud=${idSolicitud}`);
  }

  /**
   * Envía un nuevo mensaje
   */
  enviarMensaje(data: MensajeInAppRequest): Observable<MensajeInAppResponse> {
    return this.http.post<MensajeInAppResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Obtiene mensajes no leídos
   */
  getMensajesNoLeidos(): Observable<MensajeInAppResponse[]> {
    return this.http.get<MensajeInAppResponse[]>(`${this.baseUrl}?no_leidos=true`);
  }
}
