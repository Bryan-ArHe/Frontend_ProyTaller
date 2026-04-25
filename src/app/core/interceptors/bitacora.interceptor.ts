import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { BitacoraService } from '../services/bitacora.service';

export const bitacoraInterceptor: HttpInterceptorFn = (req, next) => {
  const bitacoraService = inject(BitacoraService);

  // No registrar peticiones a bitácora para evitar loops infinitos
  if (req.url.includes('/bitacora')) {
    return next(req);
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        registrarAccion(bitacoraService, req, event.status);
      }
    }),
    catchError((error) => {
      registrarAccion(bitacoraService, req, error.status);
      return throwError(() => error);
    }),
  );
};

function registrarAccion(bitacoraService: BitacoraService, req: any, status: number) {
  try {
    const evento = determinarEvento(req.method);
    const recurso = extraerRecurso(req.url);
    const accion = construirDescripcion(req.method, recurso);
    const payload = req.body ? JSON.stringify(req.body) : undefined;

    // Registrar la acción en el backend (no esperar respuesta)
    bitacoraService
      .registrarAccion({
        evento,
        recurso,
        accion,
        ip: 'cliente',
        endpoint: extraerEndpoint(req.url),
        payload,
        dispositivo: detectarDispositivo(),
        codigo_estado: status,
      })
      .subscribe({
        error: (err) => console.error('Error registrando bitácora:', err),
      });
  } catch (error) {
    console.error('Error en interceptor de bitácora:', error);
  }
}

function determinarEvento(metodo: string): string {
  switch (metodo.toUpperCase()) {
    case 'GET':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'OTHER';
  }
}

function extraerRecurso(url: string): string {
  try {
    // Extraer el recurso de la URL (ej: /api/usuarios -> usuarios)
    const partes = url.split('/').filter((p) => p && !p.startsWith('http'));
    const apiIdx = partes.findIndex((p) => p === 'api');
    if (apiIdx >= 0 && apiIdx + 1 < partes.length) {
      return partes[apiIdx + 1];
    }
    return 'desconocido';
  } catch {
    return 'desconocido';
  }
}

function extraerEndpoint(url: string): string {
  try {
    // Extraer solo la parte del endpoint (sin dominio)
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

function construirDescripcion(metodo: string, recurso: string): string {
  const acciones: { [key: string]: string } = {
    GET: `Consulta de ${recurso}`,
    POST: `Creación de ${recurso}`,
    PUT: `Actualización de ${recurso}`,
    PATCH: `Actualización parcial de ${recurso}`,
    DELETE: `Eliminación de ${recurso}`,
  };
  return acciones[metodo.toUpperCase()] || `Operación en ${recurso}`;
}

function detectarDispositivo(): string {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|phone/i.test(ua.toLowerCase())) {
    return 'mobile';
  }
  return 'web';
}
