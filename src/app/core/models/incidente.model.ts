export interface Evidencia {
  tipo: 'foto' | 'audio' | 'video';
  url: string;
}

export interface IncidenteRequest {
  latitud: number;
  longitud: number;
  descripcion: string;
  evidencias: string[];
}

export interface IncidenteResponse {
  id: number;
  latitud: number;
  longitud: number;
  descripcion: string;
  estado: string;
  created_at: string;
  id_usuario: number;
}
