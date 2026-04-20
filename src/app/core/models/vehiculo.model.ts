export interface Marca {
  id: number;
  nombre: string;
}

export interface Modelo {
  id: number;
  nombre: string;
  id_marca: number;
}

export interface Vehiculo {
  id: number;
  id_cliente: number;
  placa: string;
  marca: string;
  modelo: string;
  color?: string;
  anio: number;
}

export interface VehiculoRequest {
  placa: string;
  id_marca: number;
  id_modelo: number;
  color?: string;
  anio: number;
}

export interface VehiculoUpdate {
  placa?: string;
  color?: string;
  anio?: number;
}

export interface VehiculoResponse extends Vehiculo {
  id: number;
  marca_nombre: string;
  modelo_nombre: string;
  created_at?: string;
  updated_at?: string;
}
