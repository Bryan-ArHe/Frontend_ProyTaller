import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard Centralizado de Seguridad Jerárquica (RBAC)
 * Controla el perímetro administrativo del Tenant para los roles: superAdmin, Administrador y Gestor
 */
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  // 1. 🛡️ Doble verificación defensiva de autenticación
  if (!currentUser) {
    console.warn('❌ [AdminGuard] Acceso bloqueado: Usuario no autenticado en el sistema.');
    void router.navigate(['/login']);
    return false;
  }

  // 2. 🔑 Extraer el rol normalizado (Garantizado por el AuthGuard previo)
  const userRole = localStorage.getItem('usuario_rol') || '';
  const path = route.routeConfig?.path || '';

  // =========================================================================
  // 🏢 CASO 1: INFRAESTRUCTURA SAAS CORE (Exclusivo SuperAdmin)
  // =========================================================================
  if (path === 'gestion-empresas') {
    if (userRole === 'superAdmin') {
      console.log(`✅ [AdminGuard] Acceso Maestro concedido a infraestructura global para: ${currentUser.email}`);
      return true;
    }
    console.warn(`⚠️ [AdminGuard] Bloqueo de seguridad: El rol "${userRole}" no pertenece al grupo SuperAdmin.`);
    void router.navigate(['/dashboard']);
    return false;
  }

  // =========================================================================
  // 🔧 CASO 2: OPERACIONES LOCALES DE TALLER (Gestor y Administrador)
  // =========================================================================
  if (path === 'tecnicos') {
    if (userRole === 'Gestor' || userRole === 'Administrador') {
      console.log(`✅ [AdminGuard] Acceso Operativo concedido para la gestión de mecánicos al rol: [${userRole}]`);
      return true;
    }
    console.warn(`⚠️ [AdminGuard] Bloqueo: El rol "${userRole}" no posee credenciales para administrar personal de sucursal.`);
    void router.navigate(['/dashboard']);
    return false;
  }

  // =========================================================================
  // 👑 CASO 3: ADMINISTRACIÓN DE FRANQUICIA CENTRAL (Solo Administrador)
  // (gestion-usuarios, gestion-roles, bitacora, comisiones, monitor-triaje)
  // =========================================================================
  if (userRole === 'Administrador') {
    console.log(`✅ [AdminGuard] Acceso Central permitido para: ${currentUser.email} en el submódulo /${path}`);
    return true;
  }

  // ⛔ Rebote defensivo final si un rol no autorizado (ej: Cliente o Técnico) intenta forzar la URL
  console.warn(`🔒 [AdminGuard] Restricción RBAC activada para el rol: [${userRole}] en la ruta: /${path}`);
  void router.navigate(['/dashboard']);
  return false;
};