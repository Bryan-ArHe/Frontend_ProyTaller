export interface PlanSaas {
  nombre_plan: string;
  limite_talleres: number;
  limite_tecnicos: number;
}

export interface SuscripcionTaller {
  id_plan: number;
  estado_suscripcion: string;
  plan?: PlanSaas;
}

export interface EmpresaSaaS {
  id_usuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono: string;
  suscripciones?: SuscripcionTaller[];
}