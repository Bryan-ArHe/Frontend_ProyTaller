// ==================== ROL Y PERMISO ====================
export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
}

export interface Permiso {
  id_permiso: number;
  nombre: string;
  descripcion: string;
}

// ==================== USUARIO BASE ====================
export interface Usuario {
  id_usuario: number;
  id_rol: number;
  email: string;
  telefono: string;
  estado_cuenta: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  rol?: Rol;
}

export interface UsuarioCreate {
  email: string;
  telefono: string;
  password: string;
  id_rol: number;
}

export interface UsuarioUpdate {
  email?: string;
  telefono?: string;
  estado_cuenta?: string;
}

// ==================== AUTENTICACIÓN ====================
export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UsuarioResponse extends Usuario {
  password_hash?: string;
}
