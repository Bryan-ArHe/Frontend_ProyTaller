import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard'; // Tu guard jerárquico corregido


export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
  {
    path: 'gestion-empresas',
    loadComponent: () => import('./features/empresas/empresas.component').then(m => m.EmpresasComponent),
    canActivate: [AdminGuard] // Protegido para que solo entre el superAdmin o Admin
  }
];
