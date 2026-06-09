import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Extraemos la información del payload decodificado del token almacenado
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = JSON.parse(userJson);
    
    // El rol esperado se inyecta desde la configuración de la ruta del módulo
    const expectedRoles = route.data['roles'] as Array<string>;
    
    // Mapeamos dinámicamente según el id_rol de tu base de datos física:
    // 1 = superAdmin, 2 = Administrador, 3 = Gestor
    let currentRoleName = 'Cliente';
    if (user.id_rol === 1) currentRoleName = 'superAdmin';
    else if (user.id_rol === 2) currentRoleName = 'Administrador';
    else if (user.id_rol === 3) currentRoleName = 'Gestor';

    if (expectedRoles && !expectedRoles.includes(currentRoleName)) {
      // Redirección por falta de privilegios
      this.router.navigate(['/dashboard/home']);
      return false;
    }

    return true;
  }
}