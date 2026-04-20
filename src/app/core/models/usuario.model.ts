import { Rol } from './auth.model';

// ==================== PERFIL DE USUARIO ====================
export interface UsuarioPerfil {
  id_usuario: number;
  id_rol: number;
  email: string;
  telefono: string;
  nombres?: string;
  apellidos?: string;
  razon_social?: string; // Para empresas/talleres
  ci?: string; // Para clientes
  nit?: string; // Para talleres
  direccion?: string; // Para talleres
  estado_cuenta: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  rol?: Rol;
  created_at?: string;
  updated_at?: string;
}

export interface ActualizarPerfilData {
  email?: string;
  telefono?: string;
  nombres?: string;
  apellidos?: string;
  razon_social?: string;
  direccion?: string;
}

export interface CambiarPasswordData {
  password_actual: string;
  password_nueva: string;
  password_confirmacion: string;
}

// ==================== GESTIÓN DE USUARIOS (ADMIN) ====================
export interface UsuarioListado {
  id_usuario: number;
  email: string;
  telefono: string;
  nombres?: string;
  apellidos?: string;
  razon_social?: string;
  estado_cuenta: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  id_rol: number;
  rol_nombre?: string;
  created_at?: string;
}

export interface CambiarEstadoUsuarioData {
  estado_cuenta: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
}

export interface AsignarRolData {
  id_rol: number;
}

// ==================== RESPUESTA DEL BACKEND ====================
export interface UsuarioResponse extends UsuarioPerfil {}

export interface ListadoUsuariosResponse {
  usuarios: UsuarioListado[];
  total: number;
  pagina?: number;
  por_pagina?: number;
}
