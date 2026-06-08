// src/app/core/services/taller.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Taller, TallerCreate } from '../models/taller.model';

@Injectable({
  providedIn: 'root'
})
export class TallerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/talleres`; // Ajustar de acuerdo a tu main.py

  // GET /talleres/ - Listar talleres asociados al tenant del gestor actual
  listarTalleres(): Observable<Taller[]> {
    return this.http.get<Taller[]>(`${this.apiUrl}/`); // Nota la / al final para evitar el 307
  }

  // POST /talleres/ - Crear una sucursal inyectando la ubicación para PostGIS
  crearTaller(taller: TallerCreate): Observable<Taller> {
    return this.http.post<Taller>(`${this.apiUrl}/`, taller);
  }

  // GET /talleres/1 - Obtener una sucursal específica con su lista de técnicos
  obtenerTaller(id: number): Observable<Taller> {
    return this.http.get<Taller>(`${this.apiUrl}/${id}/`);
  }

  // 🌟 NUEVO MÉTODO: PATCH /talleres/{id_taller}/asignar-gestor
  // Sincronizado con la lógica de asignación diferida de la plataforma SaaS
  asignarGestor(idTaller: number, idGestor: number | null): Observable<any> {
    // Si idGestor es null, pasamos un string vacío para limpiar el encargado en el backend
    const queryParamGestor = idGestor ? idGestor.toString() : '';
    
    return this.http.patch<any>(
      `${this.apiUrl}/${idTaller}/asignar-gestor`, 
      null, // No enviamos cuerpo (body) ya que FastAPI lo recibe por Query Params
      {
        params: { id_gestor: queryParamGestor }
      }
    );
  }
}