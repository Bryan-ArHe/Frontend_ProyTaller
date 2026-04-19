export interface Comision {
  id_comision: number;
  id_pago: number;
  porcentaje: number;
  monto: number;
}

export interface ComisionRequest {
  id_pago: number;
  porcentaje: number;
  monto: number;
}

export interface ComisionResponse extends Comision {
  pago_id?: number;
  created_at?: string;
}

export interface Calificacion {
  id_calificacion: number;
  id_solicitud: number;
  puntuacion: number; // 1-5
  resena?: string;
}

export interface CalificacionRequest {
  id_solicitud: number;
  puntuacion: number;
  resena?: string;
}

export interface CalificacionResponse extends Calificacion {
  solicitud_id?: number;
  created_at?: string;
}
