import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no hay token, redirige a login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // Si ya hay un usuario cargado, permite el acceso
  if (authService.getCurrentUser()) {
    return true;
  }

  // Si hay token pero no hay usuario cargado, intenta cargar el perfil
  return authService.me().pipe(
    map(() => true),
    catchError(() => {
      // Si falla cargar el perfil, redirige a login
      authService.logout();
      return of(router.createUrlTree(['/login']));
    }),
  );
};
