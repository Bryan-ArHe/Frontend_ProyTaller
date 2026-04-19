export interface Pago {
  id_pago: number;
  id_solicitud: number;
  monto_subtotal: number;
  monto_total: number;
  metodo_pago?: string;
  estado_transaccion: 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO';
}

export interface PagoRequest {
  id_solicitud: number;
  monto_subtotal: number;
  monto_total: number;
  metodo_pago: string;
}

export interface PagoUpdate {
  estado_transaccion?: string;
  metodo_pago?: string;
}

export interface PagoResponse extends Pago {
  solicitud_id?: number;
  created_at?: string;
}
