export interface SolicitudServicio {
  id_solicitud: number;
  id_incidente: number;
  id_tecnico: number;
  fecha_asignacion: string;
  fecha_llegada_estimada?: string;
  fecha_finalizacion?: string;
}

export interface SolicitudServicioRequest {
  id_incidente: number;
  id_tecnico: number;
  fecha_llegada_estimada?: string;
}

export interface SolicitudServicioUpdate {
  fecha_llegada_estimada?: string;
  fecha_finalizacion?: string;
}

export interface SolicitudServicioResponse extends SolicitudServicio {
  tecnico_nombre?: string;
  incidente_id?: number;
  created_at?: string;
}
