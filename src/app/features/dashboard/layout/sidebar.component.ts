import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// ==================== INTERFACES ====================
interface SubItem {
  label: string;
  path: string;
  roles: string[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  subItems: SubItem[];
}

// ==================== CONSTANTES ====================
const MENU_ITEMS: MenuItem[] = [
  // Paquete 1: Identidad y Accesos
  {
    id: 'identidad',
    label: 'Identidad y Accesos',
    icon: '🔐',
    subItems: [
      {
        label: 'Mi Perfil',
        path: 'perfil',
        roles: ['admin', 'tecnico', 'cliente', 'gestor_taller'],
      },
      { label: 'Gestión de Usuarios', path: 'gestion-usuarios', roles: ['admin'] },
      { label: 'Gestión de Roles', path: 'gestion-roles', roles: ['admin'] },
    ],
  },

  // Paquete 2: Cuentas y Vehículos
  {
    id: 'cuentas',
    label: 'Cuentas y Vehículos',
    icon: '🚙',
    subItems: [
      { label: 'Mis Vehículos', path: 'vehiculos', roles: ['cliente'] },
      { label: 'Gestión de Talleres', path: 'talleres', roles: ['gestor_taller', 'admin'] },
      { label: 'Gestión de Técnicos', path: 'tecnicos', roles: ['gestor_taller', 'admin'] },
    ],
  },

  // Paquete 3: Captura de Emergencias e IA
  {
    id: 'emergencias',
    label: 'Captura de Emergencias',
    icon: '🆘',
    subItems: [
      { label: 'Reportar Incidente', path: 'reportar-incidente', roles: ['cliente'] },
      {
        label: 'Historial de Incidentes',
        path: 'historial-incidentes',
        roles: ['cliente', 'admin'],
      },
      { label: 'Monitor de Triaje IA', path: 'monitor-triaje', roles: ['admin'] },
    ],
  },

  // Paquete 4: Despacho Operativo e Inventario
  {
    id: 'despacho',
    label: 'Despacho Operativo',
    icon: '⚙️',
    subItems: [
      {
        label: 'Órdenes de Trabajo',
        path: 'ordenes-trabajo',
        roles: ['gestor_taller', 'tecnico', 'admin'],
      },
      { label: 'Mi Inventario Móvil', path: 'inventario-movil', roles: ['tecnico'] },
    ],
  },

  // Paquete 5: Telemetría y Comunicación
  {
    id: 'telemetria',
    label: 'Telemetría y Comunicación',
    icon: '📡',
    subItems: [
      {
        label: 'Rastreo en Vivo',
        path: 'rastreo-vivo',
        roles: ['cliente', 'gestor_taller', 'admin'],
      },
      {
        label: 'Bandeja de Mensajes',
        path: 'mensajes',
        roles: ['admin', 'tecnico', 'cliente'],
      },
    ],
  },

  // Paquete 6: Finanzas y B2B
  {
    id: 'finanzas',
    label: 'Finanzas y B2B',
    icon: '💰',
    subItems: [
      { label: 'Mis Pagos / Liquidaciones', path: 'pagos', roles: ['cliente', 'gestor_taller'] },
      { label: 'Panel de Comisiones', path: 'comisiones', roles: ['admin'] },
    ],
  },

  // Paquete 7: Auditoría y Logs
  {
    id: 'auditoria',
    label: 'Auditoría y Logs',
    icon: '📋',
    subItems: [
      { label: 'Bitácora de Auditoría', path: 'bitacora', roles: ['admin'] },
    ],
  },
];

// ==================== COMPONENTE ====================
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
      <nav class="mt-8 px-4 pb-32 space-y-1">
        @for (paquete of visiblePaquetes; track paquete.id) {
          <div class="mb-4">
            <!-- Botón del paquete (acordeón) -->
            <button
              (click)="togglePaquete(paquete.id)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              [class.bg-blue-600]="expandedPaquete === paquete.id"
            >
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ paquete.icon }}</span>
                <span class="font-semibold text-sm">{{ paquete.label }}</span>
              </div>
              <svg
                class="w-4 h-4 transition-transform duration-300"
                [class.rotate-180]="expandedPaquete === paquete.id"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            <!-- Sub-items (con animación) -->
            @if (expandedPaquete === paquete.id) {
              <div class="mt-2 ml-4 space-y-1 border-l-2 border-blue-500 pl-4">
                @for (subItem of paquete.subItems; track subItem.path) {
                  <a
                    [routerLink]="subItem.path"
                    routerLinkActive="bg-yellow-500 bg-opacity-20 border-l-2 border-yellow-400"
                    class="flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200"
                  >
                    <span class="w-2 h-2 bg-blue-300 rounded-full"></span>
                    <span>{{ subItem.label }}</span>
                  </a>
                }
              </div>
            }
          </div>
        }
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
  expandedPaquete = 'identidad'; // Paquete expandido por defecto

  constructor() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userEmail = user.email;
        this.userRole = this.getRoleName(user.id_rol);
      }
    });
  }

  /**
   * Obtiene los paquetes visibles filtrados por rol
   */
  get visiblePaquetes(): MenuItem[] {
    const userRole = this.userRole.toLowerCase();
    return MENU_ITEMS.map((paquete) => ({
      ...paquete,
      subItems: paquete.subItems.filter((item) => this.hasRole(item.roles)),
    })).filter((paquete) => paquete.subItems.length > 0);
  }

  /**
   * Verificar si el usuario tiene el rol requerido
   */
  private hasRole(itemRoles: string[]): boolean {
    return itemRoles.includes(this.userRole.toLowerCase());
  }

  /**
   * Toggle para expandir/colapsar un paquete
   */
  togglePaquete(paqueteId: string): void {
    if (this.expandedPaquete === paqueteId) {
      this.expandedPaquete = '';
    } else {
      this.expandedPaquete = paqueteId;
    }
  }

  /**
   * Mapear id_rol a nombre descriptivo
   */
  private getRoleName(id_rol: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'admin',
      2: 'tecnico',
      3: 'cliente',
      4: 'gestor_taller',
    };
    return roleMap[id_rol] || 'cliente';
  }
}
