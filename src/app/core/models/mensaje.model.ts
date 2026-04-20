export interface MensajeInApp {
  id_mensaje: number;
  id_solicitud: number;
  emisor: 'CLIENTE' | 'TECNICO';
  contenido: string;
  fecha_envio: string;
}

export interface MensajeInAppRequest {
  id_solicitud: number;
  emisor: 'CLIENTE' | 'TECNICO';
  contenido: string;
}

export interface MensajeInAppResponse extends MensajeInApp {
  created_at?: string;
}
