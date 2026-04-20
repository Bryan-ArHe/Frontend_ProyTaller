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

  // Verificar si el usuario tiene rol de ADMINISTRADOR
  // El rol puede venir como objeto con 'nombre' o como string
  const esAdmin =
    (currentUser.rol &&
      typeof currentUser.rol === 'object' &&
      currentUser.rol.nombre === 'ADMINISTRADOR') ||
    (typeof currentUser.rol === 'string' && currentUser.rol === 'ADMINISTRADOR');

  if (!esAdmin) {
    console.warn(
      `⚠️ Acceso denegado: Usuario "${currentUser.email}" no tiene permisos de administrador`,
    );
    void router.navigate(['/dashboard']);
    return false;
  }

  console.log(`✅ Acceso de admin permitido para: ${currentUser.email}`);
  return true;
};
