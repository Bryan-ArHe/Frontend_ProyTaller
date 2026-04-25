import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { HomeComponent } from './views/home/home.component';
import { AdminGuard } from '../../core/guards/admin.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      // Identidad y Accesos
      {
        path: 'perfil',
        loadComponent: () => import('../identidad/perfil.component').then((m) => m.PerfilComponent),
      },
      {
        path: 'gestion-usuarios',
        loadComponent: () =>
          import('../identidad/gestion-usuarios.component').then((m) => m.GestionUsuariosComponent),
        canActivate: [AdminGuard],
      },
      {
        path: 'gestion-roles',
        loadComponent: () =>
          import('../identidad/gestion-roles.component').then((m) => m.GestionRolesComponent),
        canActivate: [AdminGuard],
      },
      // Cuentas y Vehículos
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('../vehiculos/lista-vehiculos.component').then((m) => m.ListaVehiculosComponent),
      },
      {
        path: 'vehiculos/nuevo',
        loadComponent: () =>
          import('../vehiculos/form-vehiculo.component').then((m) => m.FormVehiculoComponent),
      },
      {
        path: 'talleres',
        loadComponent: () =>
          import('./views/talleres/talleres.component').then((m) => m.TalleresComponent),
      },
      {
        path: 'tecnicos',
        loadComponent: () =>
          import('./views/tecnicos/tecnicos.component').then((m) => m.TecnicosComponent),
      },
      // Emergencias
      {
        path: 'reportar-incidente',
        loadComponent: () =>
          import('../incidentes/reportar-incidente.component').then(
            (m) => m.ReportarIncidenteComponent,
          ),
      },
      {
        path: 'historial-incidentes',
        loadComponent: () =>
          import('./views/historial-incidentes/historial-incidentes.component').then(
            (m) => m.HistorialIncidentesComponent,
          ),
      },
      {
        path: 'monitor-triaje',
        loadComponent: () =>
          import('./views/monitor-triaje/monitor-triaje.component').then(
            (m) => m.MonitorTriajeComponent,
          ),
      },
      // Despacho Operativo
      {
        path: 'ordenes-trabajo',
        loadComponent: () =>
          import('./views/ordenes-trabajo/ordenes-trabajo.component').then(
            (m) => m.OrdenesTrabajoComponent,
          ),
      },
      {
        path: 'inventario-movil',
        loadComponent: () =>
          import('./views/inventario-movil/inventario-movil.component').then(
            (m) => m.InventarioMovilComponent,
          ),
      },
      // Telemetría
      {
        path: 'rastreo-vivo',
        loadComponent: () =>
          import('./views/rastreo-vivo/rastreo-vivo.component').then((m) => m.RastreoVivoComponent),
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('./views/mensajes/mensajes.component').then((m) => m.MensajesComponent),
      },
      // Finanzas
      {
        path: 'pagos',
        loadComponent: () => import('./views/pagos/pagos.component').then((m) => m.PagosComponent),
      },
      {
        path: 'comisiones',
        loadComponent: () =>
          import('./views/comisiones/comisiones.component').then((m) => m.ComisionesComponent),
      },
      // Auditoría y Logs
      {
        path: 'bitacora',
        loadComponent: () =>
          import('./views/bitacora/bitacora.component').then((m) => m.BitacoraComponent),
        canActivate: [AdminGuard],
      },
    ],
  },
];
