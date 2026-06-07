import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que verifica si el usuario tiene el rol de ADMINISTRADOR
 * Solo permite acceso a rutas protegidas para admins
 */
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

// Verificar si el usuario está autenticado
  if (!currentUser) {
    console.warn('❌ Acceso denegado: Usuario no autenticado');
    void router.navigate(['/login']);
    return false;
  }

// Obtener el nombre del rol, considerando que puede ser un objeto o una cadena
let rolNombre = '';
  if(currentUser.rol) {
    if (typeof currentUser.rol === 'object') {
      rolNombre = currentUser.rol.nombre || '';
    } else if (typeof currentUser.rol === 'string') {
      rolNombre = currentUser.rol;
    }
  }

// Verificar si el rol del usuario es ADMINISTRADOR o superAdmin
const tieneAccesoAdmin = rolNombre === 'Administrador' || rolNombre == 'superAdmin';
  if (!tieneAccesoAdmin) {
    console.warn(
      `⚠️ Acceso denegado: Usuario "${currentUser.email}" con el rol "${rolNombre}" no tiene permisos administrativos`,
    );
    void router.navigate(['/dashboard']);
    return false;
  }

  console.log(`✅ Acceso de administrativo permitido para: ${currentUser.email} con rol: ${rolNombre}`);
  return true;
};
