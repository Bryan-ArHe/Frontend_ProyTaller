
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
  marca: string;
  modelo: string;
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
  created_at?: string;
  updated_at?: string;
}
