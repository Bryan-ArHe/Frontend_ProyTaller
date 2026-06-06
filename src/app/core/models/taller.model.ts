// 1. INTERFAZ PRINCIPAL (Lo que recibimos del backend: GET /talleres)
export interface Taller {
  id_taller: number;
  id_gestor: number;
  nombre: string;
  direccion: string;
  telefono?: string; // El "?" significa que es opcional (puede ser undefined/null)
  ubicacion_wkt?: string | null; 
  especialidad?: string;
  capacidad_vehiculos: number;
  estado_activo: boolean;
  fecha_registro: string; // Las fechas ISO de FastAPI llegan como string a Angular
}

// 2. INTERFAZ DE CREACIÓN (Lo que enviamos al backend: POST /talleres)
export interface TallerCreate {
  nombre: string;
  direccion: string;
  telefono?: string;
  ubicacion_coordenadas?:{
    latitud?: number;
    longitud?: number;
  }
  especialidad?: string;
  capacidad_vehiculos?: number; // FastAPI tiene valor por defecto 1, por lo que es opcional enviarlo
  estado_activo?: boolean;      // FastAPI tiene valor por defecto true
  id_gestor: number;
}

// 3. INTERFAZ DE ACTUALIZACIÓN (Lo que enviamos al backend: PUT /talleres/{id})
export interface TallerUpdate {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  ubicacion_coordenadas?:{
    latitud?: number;
    longitud?: number;
  }
  especialidad?: string;
  capacidad_vehiculos?: number;
  estado_activo?: boolean;
}