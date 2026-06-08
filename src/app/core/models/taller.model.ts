// 🌟 SUB-INTERFAZ AUXILIAR: Datos del encargado embebidos por el backend (joinedload)
export interface GestorResumen {
  nombre: string;
  apellido: string;
}

// 1. INTERFAZ PRINCIPAL (Lo que recibimos del backend: GET /talleres)
export interface Taller {
  id_taller: number;
  id_gestor: number | null; // 🌟 CAMBIO: Ahora permite 'null' cuando la sucursal esté vacante
  nombre: string;
  direccion: string;
  telefono?: string; 
  ubicacion_wkt?: string | null; 
  especialidad?: string;
  capacidad_vehiculos: number;
  estado_activo: boolean;
  fecha_registro: string; 
  
  // 🌟 ADICIÓN: Permite que Angular autocomplete taller.gestor?.nombre sin romper el tipado
  gestor?: GestorResumen | null; 
}

// 2. INTERFAZ DE CREACIÓN (Lo que enviamos al backend: POST /talleres)
export interface TallerCreate {
  nombre: string;
  direccion: string;
  telefono?: string;
  ubicacion_coordenadas?: {
    latitud?: number;
    longitud?: number;
  }
  especialidad?: string;
  capacidad_vehiculos?: number; 
  estado_activo?: boolean;      
  
  // 🌟 CAMBIO: Al crear de forma diferida, no enviamos id_gestor (el backend lo inicializa en None)
  // o lo enviamos explícitamente como opcional/null.
  id_gestor?: number | null; 
}

// 3. INTERFAZ DE ACTUALIZACIÓN (Lo que enviamos al backend: PATCH/PUT /talleres/{id})
export interface TallerUpdate {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  ubicacion_coordenadas?: {
    latitud?: number;
    longitud?: number;
  }
  especialidad?: string;
  capacidad_vehiculos?: number;
  estado_activo?: boolean;
  id_gestor?: number | null; // 🌟 ADICIÓN: Para soportar actualizaciones individuales de encargado
}