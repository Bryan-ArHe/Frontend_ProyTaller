// ==================== EVIDENCIA ====================
export interface Evidencia {
  id_evidencia?: number;
  id_incidente: number;
  tipo: 'AUDIO' | 'FOTOGRAFIA' | 'TEXTO';
  url_archivo: string;
  tamano_mb?: number;
}

export interface EvidenciaRequest {
  tipo: 'AUDIO' | 'FOTOGRAFIA' | 'TEXTO';
  url: string;
  archivo?: File;
}

// ==================== TRIAJE IA ====================
export interface TriajeIA {
  id_triaje: number;
  id_incidente: number;
  transcripcion_audio?: string;
  analisis_visual?: string;
  categoria_sugerida: string;
  nivel_prioridad: number;
  nivel_confianza: number;
}

export interface TriajeIAResponse extends TriajeIA {
  created_at?: string;
}

// ==================== HISTORIAL INCIDENTE ====================
export interface HistorialIncidente {
  id_historial: number;
  id_incidente: number;
  estado_anterior?: string;
  estado_actual: string;
  fecha_cambio: string;
}

// ==================== INCIDENTE ====================
export interface Incidente {
  id: number;
  id_cliente: number;
  id_vehiculo: number;
  fecha_incidente: string;
  latitud: number;
  longitud: number;
  estado_incidente: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'CANCELADO';
  triaje?: TriajeIA;
  evidencias?: Evidencia[];
  historial?: HistorialIncidente[];
}

export interface IncidenteRequest {
  id_vehiculo?: number;
  latitud: number;
  longitud: number;
  descripcion?: string;
  evidencias?: string[];
}

export interface IncidenteResponse extends Incidente {
  cliente_nombre?: string;
  vehiculo_placa?: string;
  created_at?: string;
}
