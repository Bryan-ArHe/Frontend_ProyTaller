// 1. INTERFAZ PRINCIPAL (Lo que recibimos del backend: GET /tecnicos)
export interface Tecnico {
  id_tecnico: number;
  id_usuario: number; // Foránea a Usuario
  id_taller: number;  // Foránea a Taller
  especialidad?: string;
  estado_disponibilidad: string; // 'Libre', 'Ocupado', 'Inactivo'
  
  // Coordenadas para el sistema de despacho
  latitud_actual?: number;
  longitud_actual?: number;
  
  created_at: string;
}

// 2. INTERFAZ DE CREACIÓN (Lo que enviamos al backend: POST /tecnicos)
export interface TecnicoCreate {
  id_usuario: number;
  id_taller: number;
  especialidad?: string;
  estado_disponibilidad?: string; // FastAPI pone 'Libre' por defecto si no se envía
  latitud_actual?: number;
  longitud_actual?: number;
}

// 3. INTERFAZ DE ACTUALIZACIÓN (Lo que enviamos al backend: PUT /tecnicos/{id})
export interface TecnicoUpdate {
  especialidad?: string;
  estado_disponibilidad?: string;
  latitud_actual?: number;
  longitud_actual?: number;
}