import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmpresaSaaS } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  private API_URL = environment.apiUrl || 'http://127.0.0.1:8000'; 

  // 1. Obtener todas las empresas (usuarios con rol Administrador)
  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuarios/`);
  }

  // 2. Registrar el usuario root de la empresa
  crearEmpresa(empresa: EmpresaSaaS): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/usuarios/`, empresa);
  }

  // 3. Modificar el plan o estado en la tabla de suscripciones
  actualizarSuscripcion(idUsuarioAdmin: number, idPlan: number, estado: string): Observable<any> {
    const url = `${this.API_URL}/saas/suscripcion/${idUsuarioAdmin}?id_nuevo_plan=${idPlan}&estado=${estado}`;
    return this.http.put<any>(url, {});
  }
  
}