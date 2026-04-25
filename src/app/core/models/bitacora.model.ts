export interface Bitacora {
  id_bitacora: number;
  id_usuario: number;
  nombre_usuario: string;
  evento: string;
  recurso: string;
  accion: string;
  ip: string;
  endpoint: string;
  payload?: string;
  fecha: string;
  dispositivo?: string;
}
