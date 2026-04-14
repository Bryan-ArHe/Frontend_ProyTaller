export interface Marca {
  id: number;
  nombre: string;
}

export interface Modelo {
  id: number;
  nombre: string;
  id_marca: number;
}

export interface VehiculoRequest {
  placa: string;
  color: string;
  anio: number;
  id_modelo: number;
}

export interface VehiculoResponse {
  id: number;
  placa: string;
  color: string;
  anio: number;
  id_modelo: number;
  marca_nombre: string;
  modelo_nombre: string;
  created_at: string;
}
