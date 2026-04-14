import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div
      class="w-64 bg-gradient-to-b from-blue-900 to-blue-800 h-screen fixed left-0 top-0 text-white shadow-lg overflow-y-auto"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-blue-700">
        <h1 class="text-2xl font-bold">🚗 EmergAuto</h1>
        <p class="text-blue-200 text-xs mt-1">Plataforma de Emergencias</p>
      </div>

      <!-- Navegación -->
      <nav class="mt-8 px-4 pb-32">
        <div class="space-y-2">
          @for (item of visibleNavItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-blue-600 border-l-4 border-yellow-400"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>

      <!-- Información del usuario (al fondo) -->
      <div class="fixed bottom-0 left-0 w-64 p-4 border-t border-blue-700 bg-blue-900">
        <div class="text-sm">
          <p class="text-blue-200">Conectado como:</p>
          <p class="font-semibold truncate">{{ userEmail }}</p>
          <p class="text-xs text-blue-300 mt-1">Rol: {{ userRole }}</p>
        </div>
      </div>
    </div>
  `,
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  userEmail = '';
  userRole = '';

  readonly allNavItems: NavItem[] = [
    { label: 'Inicio', path: '', icon: '🏠', roles: ['admin', 'operador', 'usuario', 'tecnico'] },
    { label: 'Mis Vehículos', path: 'vehiculos', icon: '🚙', roles: ['usuario'] },
    { label: 'Solicitar Auxilio', path: 'solicitar-auxilio', icon: '🆘', roles: ['usuario'] },
    { label: 'Mis Solicitudes', path: 'mis-solicitudes', icon: '📋', roles: ['usuario'] },
    { label: 'Órdenes Activas', path: 'ordenes', icon: '⚙️', roles: ['operador', 'tecnico'] },
    { label: 'Gestión Global', path: 'gestion', icon: '⚡', roles: ['admin'] },
    { label: 'Usuarios', path: 'usuarios', icon: '👥', roles: ['admin'] },
    { label: 'Reportes', path: 'reportes', icon: '📊', roles: ['admin', 'operador'] },
  ];

  get visibleNavItems(): NavItem[] {
    const userRole = this.userRole.toLowerCase();
    return this.allNavItems.filter((item) => item.roles.includes(userRole));
  }

  constructor() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userEmail = user.email;
        this.userRole = this.getRoleName(user.id_rol);
      }
    });
  }

  private getRoleName(id_rol: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'admin',
      2: 'operador',
      3: 'tecnico',
      4: 'usuario',
    };
    return roleMap[id_rol] || 'usuario';
  }
}
