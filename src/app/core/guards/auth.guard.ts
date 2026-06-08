import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. 🛡️ VERIFICACIÓN DE TOKEN: Si no existe sesión activa, rebota de inmediato a la pantalla de Login
  if (!authService.isLoggedIn()) {
    console.warn('🔒 [AuthGuard] Intento de acceso anónimo bloqueado. Redirigiendo a Login.');
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
    map((user) => {
      if (user) {
        // Extraemos el rol de forma segura, ya sea si el backend devuelve un objeto o un string directo
        let rolNombre = '';
        if (user.rol) {
          rolNombre = typeof user.rol === 'object' ? (user.rol.nombre || '') : user.rol;
        }

        // Mapeo defensivo estricto para asegurar la consistencia del rol de operaciones en la Opción B
        if (user.id_rol === 3 || rolNombre.toLowerCase() === 'gestortaller') {
          rolNombre = 'Gestor';
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
      
      // Limpieza total del ecosistema local para evitar bucles infinitos de redirección
      authService.logout(); 
      return of(router.createUrlTree(['/login']));
    }),
  );
};