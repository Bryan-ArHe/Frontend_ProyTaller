import { Usuario } from './auth.model';

export interface GestorTaller extends Usuario {
  id_taller: number;
  razon_social: string;
  nit: string;
  direccion: string;
}

export interface GestorTallerCreate {
  email: string;
  telefono: string;
  password: string;
  razon_social: string;
  nit: string;
  direccion: string;
  id_rol: number;
}

export interface GestorTallerUpdate {
  razon_social?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}

export interface GestorTallerResponse extends GestorTaller {
  created_at?: string;
  updated_at?: string;
}

// Alias para compatibilidad
export type TallerResponse = GestorTallerResponse;
