import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const tokenActivo = authService.getToken() || localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  if (!tokenActivo) {
    console.warn('🔒 [AuthGuard] Intento de acceso anónimo bloqueado. Redirigiendo a Login.');
    // 🌟 AJUSTA ESTO: Si tu ruta en app.routes.ts es '/login' pon ['/login']. Si es '/auth/login' déjalo así.
    return router.createUrlTree(['/login']); 
  }

  // 2. ⚡ SESIÓN EN MEMORIA VIVA: Si el estado reactivo ya tiene cargado al usuario, da luz verde
  const usuarioActual = authService.getCurrentUser();
  if (usuarioActual) {
    return true;
  }

  // 3. 🔄 CONTROL DE PERSISTENCIA (F5 / REFRESH): 
  // Si hay token pero la memoria está limpia, sincroniza el perfil con el backend antes de renderizar las vistas
  return authService.me().pipe(
    map((user: any) => {
      if (user) {
        // 🌟 CORRECCIÓN CRÍTICA: Leemos de forma tolerante el JSON plano del backend
        let rolNombre = user.rol_nombre || user.rolNombre || '';
        
        // Caída por si acaso viene en el formato clásico anterior
        if (!rolNombre && user.rol) {
          rolNombre = typeof user.rol === 'object' ? (user.rol.nombre || '') : user.rol;
        }

        // Mapeo defensivo estricto para asegurar la consistencia del rol de operaciones
        if (user.id_rol === 3 || rolNombre.toLowerCase() === 'gestortaller') {
          rolNombre = 'Gestor';
        } else if (user.id_rol === 2) {
          rolNombre = 'Administrador';
        } else if (user.id_rol === 1) {
          rolNombre = 'superAdmin';
        }

        // Estampamos las banderas de sesión de salvavidas en el LocalStorage
        if (rolNombre) {
          localStorage.setItem('usuario_rol', rolNombre);
        }
        if (user.nombre) {
          localStorage.setItem('usuario_nombre', user.nombre);
        }

        console.log(`🔑 [AuthGuard] Perfil del Tenant recuperado tras refrescar: ${user.email} con Rol: ${rolNombre}`);
      }
      return true;
    }),
    catchError((err) => {
      console.error('❌ [AuthGuard] El token es inválido o el servidor rechazó la sesión:', err);
      
      // 🌟 Evitamos que limpie de golpe si fue un error de red temporal
      sessionStorage.clear();
      localStorage.clear();
      return of(router.createUrlTree(['/auth/login']));
    }),
  );
};