import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { HomeComponent } from './views/home/home.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      // Aquí irán las otras rutas hijas del dashboard
      // { path: 'vehiculos', component: VehiculosComponent },
      // { path: 'solicitar-auxilio', component: SolicitarAuxilioComponent },
      // etc...
    ],
  },
];
