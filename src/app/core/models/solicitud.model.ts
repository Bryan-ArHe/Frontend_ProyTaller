export type EstadoSolicitud = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'CANCELADO';

export interface SolicitudServicio {
  id_solicitud: number;
  codigo_orden: string;
  id_gestor: number;
  id_incidente: number;
  id_tecnico: number;
  id_taller: number | null;
  estado: EstadoSolicitud;
  descripcion_trabajo: string | null;
  observaciones_tecnicas: string | null;
  total_mano_obra: number;
  total_repuestos: number;
  total_general: number;
  fecha_asignacion: string;
  fecha_finalizacion: string | null;
}

export interface SolicitudServicioCreate {
  id_incidente: number;
  id_tecnico: number;
  id_taller?: number;
}

export interface SolicitudServicioUpdate {
  estado: EstadoSolicitud;
  descripcion_trabajo?: string;
  observaciones_tecnicas?: string;
}

export interface SolicitudServicioRequest {
  id_incidente: number;
  id_tecnico: number;
  fecha_llegada_estimada?: string;
}

export interface SolicitudServicioResponse extends SolicitudServicio {
  tecnico_nombre?: string;
  incidente_id?: number;
  created_at?: string;
}
