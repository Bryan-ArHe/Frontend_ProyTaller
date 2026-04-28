// 1. INTERFAZ PRINCIPAL (Lo que recibimos del backend: GET /talleres)
export interface Taller {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string; // El "?" significa que es opcional (puede ser undefined/null)
  latitud?: number;
  longitud?: number;
  especialidad?: string;
  capacidad_vehiculos: number;
  estado_activo: boolean;
  id_propietario: number;
  created_at: string; // Las fechas ISO de FastAPI llegan como string a Angular
}

// 2. INTERFAZ DE CREACIÓN (Lo que enviamos al backend: POST /talleres)
export interface TallerCreate {
  nombre: string;
  direccion: string;
  telefono?: string;
  latitud?: number;
  longitud?: number;
  especialidad?: string;
  capacidad_vehiculos?: number; // FastAPI tiene valor por defecto 1, por lo que es opcional enviarlo
  estado_activo?: boolean;      // FastAPI tiene valor por defecto true
  id_propietario: number;
}

// 3. INTERFAZ DE ACTUALIZACIÓN (Lo que enviamos al backend: PUT /talleres/{id})
export interface TallerUpdate {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  latitud?: number;
  longitud?: number;
  especialidad?: string;
  capacidad_vehiculos?: number;
  estado_activo?: boolean;
}