import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteCreate, ClienteUpdate, ClienteResponse } from '../models/cliente.model';
import { Usuario } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/api/usuarios`;
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene el perfil del usuario autenticado
   */
  getMePerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.authUrl}/me`);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene todos los usuarios (admin)
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}`);
  }

  /**
   * Actualiza un usuario
   */
  actualizarUsuario(id: number, data: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Elimina un usuario
   */
  eliminarUsuario(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene todos los clientes
   */
  getClientes(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(`${this.baseUrl}/clientes`);
  }

  /**
   * Obtiene un cliente por ID
   */
  getCliente(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/clientes/${id}`);
  }
}
