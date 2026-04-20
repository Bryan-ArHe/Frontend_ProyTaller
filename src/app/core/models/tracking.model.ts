export interface UbicacionTracking {
  id_tracking: number;
  id_tecnico: number;
  latitud: number;
  longitud: number;
  fecha_hora: string;
}

export interface UbicacionTrackingRequest {
  id_tecnico: number;
  latitud: number;
  longitud: number;
}

export interface UbicacionTrackingResponse extends UbicacionTracking {
  tecnico_nombre?: string;
  created_at?: string;
}
