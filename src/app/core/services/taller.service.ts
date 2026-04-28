import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Taller, TallerCreate, TallerUpdate } from '../models/taller.model';

@Injectable({
  providedIn: 'root'
})
export class TallerService {
  // Construimos la URL base apuntando al router que hicimos en FastAPI
  private apiUrl = `${environment.apiUrl}/talleres/`;

  // Inyectamos el cliente HTTP de Angular
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los talleres activos (GET)
   */
  getTalleres(skip: number = 0, limit: number = 100): Observable<Taller[]> {
    return this.http.get<Taller[]>(`${this.apiUrl}?skip=${skip}&limit=${limit}`);
  }

  /**
   * Obtiene un taller específico por su ID (GET)
   */
  getTaller(id: number): Observable<Taller> {
    return this.http.get<Taller>(`${this.apiUrl}${id}`);
  }

  /**
   * Crea un nuevo taller (POST)
   */
  createTaller(taller: TallerCreate): Observable<Taller> {
    return this.http.post<Taller>(this.apiUrl, taller);
  }

  /**
   * Actualiza los datos de un taller existente (PUT)
   */
  updateTaller(id: number, taller: TallerUpdate): Observable<Taller> {
    return this.http.put<Taller>(`${this.apiUrl}${id}`, taller);
  }

  /**
   * Desactiva un taller (Borrado lógico) (DELETE)
   */
  deleteTaller(id: number): Observable<Taller> {
    return this.http.delete<Taller>(`${this.apiUrl}${id}`);
  }
}