export interface UsuarioCreate {
  email: string;
  telefono: string;
  password: string;
  id_rol: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UsuarioResponse {
  email: string;
  telefono: string;
  estado_cuenta: string;
  id_rol: number;
}
