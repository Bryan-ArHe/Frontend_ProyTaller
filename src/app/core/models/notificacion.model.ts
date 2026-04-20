export interface NotificacionPush {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  cuerpo: string;
  es_leida: boolean;
  fecha_envio: string;
}

export interface NotificacionPushRequest {
  id_usuario: number;
  titulo: string;
  cuerpo: string;
}

export interface NotificacionPushUpdate {
  es_leida?: boolean;
}

export interface NotificacionPushResponse extends NotificacionPush {
  created_at?: string;
}
