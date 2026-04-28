import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tecnico, TecnicoCreate, TecnicoUpdate } from '../models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private apiUrl = `${environment.apiUrl}/tecnicos`;

  constructor(private http: HttpClient) { }

  // --- LECTURAS ESTRATÉGICAS ---

  /**
   * Obtiene SOLO los técnicos listos para atender emergencias.
   */
  getTecnicosLibres(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.apiUrl}/libres`);
  }

  /**
   * Obtiene los técnicos que pertenecen a un taller en específico.
   */
  getTecnicosPorTaller(idTaller: number): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.apiUrl}/taller/${idTaller}`);
  }

  // --- LECTURAS GENERALES Y CRUD ---

  /**
   * Obtiene la lista completa de técnicos activos.
   */
  getTecnicos(skip: number = 0, limit: number = 100): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.apiUrl}/?skip=${skip}&limit=${limit}`);
  }

  /**
   * Obtiene los detalles de un técnico específico.
   */
  getTecnico(idTecnico: number): Observable<Tecnico> {
    return this.http.get<Tecnico>(`${this.apiUrl}/${idTecnico}`);
  }

  /**
   * Registra un nuevo técnico.
   */
  createTecnico(tecnico: TecnicoCreate): Observable<Tecnico> {
    return this.http.post<Tecnico>(`${this.apiUrl}/`, tecnico);
  }

  /**
   * Actualiza el estado o la ubicación de un técnico.
   */
  updateTecnico(idTecnico: number, tecnico: TecnicoUpdate): Observable<Tecnico> {
    return this.http.put<Tecnico>(`${this.apiUrl}/${idTecnico}`, tecnico);
  }

  /**
   * Da de baja a un técnico (Borrado lógico).
   */
  deleteTecnico(idTecnico: number): Observable<Tecnico> {
    return this.http.delete<Tecnico>(`${this.apiUrl}/${idTecnico}`);
  }
}