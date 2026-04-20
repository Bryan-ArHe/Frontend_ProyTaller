import { Usuario } from './auth.model';

export interface Tecnico extends Usuario {
  id_tecnico: number;
  id_taller: number;
  nombres: string;
  especialidad: string;
  esta_disponible: boolean;
}

export interface TecnicoCreate {
  email: string;
  telefono: string;
  password: string;
  nombres: string;
  especialidad: string;
  id_taller: number;
  id_rol: number;
}

export interface TecnicoUpdate {
  nombres?: string;
  especialidad?: string;
  esta_disponible?: boolean;
  email?: string;
  telefono?: string;
}

export interface TecnicoResponse extends Tecnico {
  taller_nombre?: string;
  created_at?: string;
  updated_at?: string;
}
