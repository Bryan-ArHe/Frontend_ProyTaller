import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SolicitudServicio, SolicitudServicioCreate, SolicitudServicioUpdate } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/solicitudes-servicio`;

  // GET /solicitudes-servicio/ - Listado global para monitoreo administrativo
  listarTodas(): Observable<SolicitudServicio[]> {
    return this.http.get<SolicitudServicio[]>(`${this.apiUrl}/`);
  }

  // POST /solicitudes-servicio/asignar/ - Crea la orden de trabajo (Bitácora WEB)
  asignarIncidente(payload: SolicitudServicioCreate): Observable<SolicitudServicio> {
    return this.http.post<SolicitudServicio>(`${this.apiUrl}/asignar/`, payload);
  }

  // PUT /solicitudes-servicio/{id}/estado/ - Actualizar progreso (Bitácora MOBILE)
  actualizarEstado(id: number, payload: SolicitudServicioUpdate): Observable<SolicitudServicio> {
    return this.http.put<SolicitudServicio>(`${this.apiUrl}/${id}/estado/`, payload);
  }

  // GET /solicitudes-servicio/tecnico/{id}/ - Listar órdenes asignadas al perfil del técnico
  listarPorTecnico(tecnicoId: number): Observable<SolicitudServicio[]> {
    return this.http.get<SolicitudServicio[]>(`${this.apiUrl}/tecnico/${tecnicoId}/`);
  }
}
