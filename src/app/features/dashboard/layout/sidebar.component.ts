import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

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
    <aside
      class="sidebar"
      [class.sidebar-open]="layoutService.isSidebarOpen()"
    >
      <!-- Logo -->
      <div class="sidebar-logo">
        <h1 class="logo-title">🚗 EmergAuto</h1>
        <p class="logo-subtitle">Plataforma de Emergencias</p>
      </div>

      <!-- Navegación -->
      <nav class="sidebar-nav">
        @for (paquete of visiblePaquetes; track paquete.id) {
          <div class="nav-section">
            <!-- Botón del paquete (acordeón) -->
            <button
              class="nav-section-btn"
              [class.active]="expandedPaquete === paquete.id"
              (click)="togglePaquete(paquete.id)"
              type="button"
            >
              <div class="nav-section-left">
                <span class="nav-icon">{{ paquete.icon }}</span>
                <span class="nav-label">{{ paquete.label }}</span>
              </div>
              <svg
                class="nav-chevron"
                [class.rotated]="expandedPaquete === paquete.id"
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
              <div class="nav-submenu">
                @for (subItem of paquete.subItems; track subItem.path) {
                  <a
                    class="nav-subitem"
                    [routerLink]="subItem.path"
                    routerLinkActive="active"
                    (click)="onNavigation()"
                  >
                    <span class="nav-dot"></span>
                    <span class="nav-subitem-label">{{ subItem.label }}</span>
                  </a>
                }
              </div>
            }
          </div>
        }
      </nav>

      <!-- Información del usuario (al fondo) -->
      <div class="sidebar-footer">
        <div class="user-info">
          <p class="user-label">Conectado como:</p>
          <p class="user-email">{{ userEmail }}</p>
          <p class="user-role">Rol: {{ userRole }}</p>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);

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
   * Callback cuando se hace clic en un enlace de navegación
   * Cierra el sidebar en móviles
   */
  onNavigation(): void {
    // Cerrar sidebar solo en móviles (ancho < 768px)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.layoutService.closeSidebar();
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

