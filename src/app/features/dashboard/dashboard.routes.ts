import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { HomeComponent } from './views/home/home.component';
import { EmpresasComponent } from '../empresas/empresas.component';
import { TalleresComponent } from '../talleres/talleres.component';
import { TecnicosComponent } from './views/tecnicos/tecnicos.component';
import { AdminGuard } from '../../core/guards/admin.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      
      // Vista exclusiva para el superAdmin de la Plataforma SaaS (Catálogo y aprovisionamiento)
      { 
        path: 'tenants', 
        component: EmpresasComponent, 
        canActivate: [AdminGuard],
        data: { roles: ['superAdmin'] } 
      },
      
      // Vista compartida: El Administrador (2) gestiona la red, el Gestor (3) visualiza su sucursal única
      { 
        path: 'sucursales', 
        component: TalleresComponent, 
        canActivate: [AdminGuard],
        data: { roles: ['Administrador', 'Gestor'] } 
      },
      
      // Gestión operativa de la nómina de técnicos asignados
      { 
        path: 'operadores', 
        component: TecnicosComponent, 
        canActivate: [AdminGuard],
        data: { roles: ['Administrador', 'Gestor'] } 
      }
    ]
  }
];