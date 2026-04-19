import { Usuario } from './auth.model';

export interface Cliente extends Usuario {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  ci: string;
}

export interface ClienteCreate {
  email: string;
  telefono: string;
  password: string;
  nombres: string;
  apellidos: string;
  ci: string;
  id_rol: number;
}

export interface ClienteUpdate {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
}

export interface ClienteResponse extends Cliente {
  created_at?: string;
  updated_at?: string;
}
