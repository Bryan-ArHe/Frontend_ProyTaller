import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marca, Modelo, VehiculoRequest, VehiculoResponse } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly baseUrl = 'http://localhost:8000/api/vehiculos';

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los vehículos del usuario logueado
   */
  getMisVehiculos(): Observable<VehiculoResponse[]> {
    return this.http.get<VehiculoResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Crea un nuevo vehículo
   */
  crearVehiculo(data: VehiculoRequest): Observable<VehiculoResponse> {
    return this.http.post<VehiculoResponse>(`${this.baseUrl}`, data);
  }

  /**
   * Obtiene todas las marcas disponibles
   */
  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.baseUrl}/marcas`);
  }

  /**
   * Obtiene los modelos de una marca específica
   */
  getModelosByMarca(idMarca: number): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.baseUrl}/marcas/${idMarca}/modelos`);
  }

  /**
   * Obtiene un vehículo por ID
   */
  getVehiculo(id: number): Observable<VehiculoResponse> {
    return this.http.get<VehiculoResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Elimina un vehículo
   */
  eliminarVehiculo(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
