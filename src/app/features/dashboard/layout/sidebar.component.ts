import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

// ==================== CONSTANTES DE NAVEGACIÓN MULTI-TENANT SINKRONIZADAS ====================
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'identidad',
    label: 'Identidad y Accesos',
    icon: '🔐',
    subItems: [
      { label: 'Mi Perfil', path: 'perfil', roles: ['superAdmin', 'Administrador', 'Gestor', 'Tecnico', 'Cliente'] },
      { label: 'Gestión de Usuarios', path: 'gestion-usuarios', roles: ['superAdmin', 'Administrador'] },
      { label: 'Gestión de Roles', path: 'gestion-roles', roles: ['superAdmin', 'Administrador'] },
    ],
  },
  {
    id: 'cuentas',
    label: 'Cuentas y Vehículos',
    icon: '🚙',
    subItems: [
      { label: 'Mis Vehículos', path: 'vehiculos', roles: ['Cliente'] },
      { label: 'Gestión de Talleres', path: 'talleres', roles: ['Administrador', 'Gestor'] },
      { label: 'Gestión de Técnicos', path: 'tecnicos', roles: ['Administrador', 'Gestor'] }, // 🌟 Sincronizado: Gestor y Admin controlan operarios
    ],
  },
  {
    id: 'emergencias',
    label: 'Captura de Emergencias',
    icon: '🆘',
    subItems: [
      { label: 'Reportar Incidente', path: 'reportar-incidente', roles: ['Cliente'] },
      { label: 'Historial de Incidentes', path: 'historial-incidentes', roles: ['Cliente', 'Administrador', 'Gestor', 'Tecnico'] },
      { label: 'Monitor de Triaje IA', path: 'monitor-triaje', roles: ['superAdmin', 'Administrador'] },
    ],
  },
  {
    id: 'despacho',
    label: 'Despacho Operativo',
    icon: '⚙️',
    subItems: [
      { label: 'Órdenes de Trabajo', path: 'ordenes-trabajo', roles: ['Administrador', 'Gestor', 'Tecnico'] },
      { label: 'Mi Inventario Móvil', path: 'inventario-movil', roles: ['Tecnico'] },
    ],
  },
  {
    id: 'telemetria',
    label: 'Telemetría y Comunicación',
    icon: '📡',
    subItems: [
      { label: 'Rastreo en Vivo', path: 'rastreo-vivo', roles: ['Administrador', 'Gestor', 'Tecnico', 'Cliente'] },
      { label: 'Bandeja de Mensajes', path: 'mensajes', roles: ['superAdmin', 'Administrador', 'Gestor', 'Tecnico', 'Cliente'] },
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas y B2B',
    icon: '💰',
    subItems: [
      { label: 'Mis Pagos / Liquidaciones', path: 'pagos', roles: ['Gestor', 'Cliente'] },
      { label: 'Panel de Comisiones', path: 'comisiones', roles: ['Administrador'] },
    ],
  },
  {
    id: 'auditoria',
    label: 'Auditoría y Logs',
    icon: '📋',
    subItems: [
      { label: 'Bitácora de Auditoría', path: 'bitacora', roles: ['superAdmin', 'Administrador'] }, // 🌟 superAdmin puede auditar logs del Core SaaS
    ],
  },
  {
    id: 'empresa',
    label: 'Gestión de Empresas',
    icon: '🏢',
    subItems: [
      { label: 'Empresas Inquilinas', path: 'tenants', roles: ['superAdmin'] }, // 🌟 Unificado con tu dashboard.routes.ts
    ],
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);
  private readonly destroyRef = inject(DestroyRef);

  userEmail = '';
  userRole = '';
  expandedPaquete = 'identidad';

  constructor() {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user) {
          this.userEmail = user.email;
          this.userRole = this.getRoleName(user.id_rol);
          localStorage.setItem('usuario_rol', this.userRole);
        }
      });
  }

 ngOnInit(): void {
  this.userRole = localStorage.getItem('usuario_rol') || ''; // 🌟 Correcto
}

  get visiblePaquetes(): MenuItem[] {
    if (!this.userRole) return [];
    
    return MENU_ITEMS.map((paquete) => ({
      ...paquete,
      subItems: paquete.subItems.filter((item) => this.hasRole(item.roles)),
    })).filter((paquete) => paquete.subItems.length > 0);
  }

  private hasRole(itemRoles: string[]): boolean {
    const roleLower = this.userRole.toLowerCase();
    return itemRoles.some((r) => r.toLowerCase() === roleLower);
  }

  togglePaquete(paqueteId: string): void {
    this.expandedPaquete = this.expandedPaquete === paqueteId ? '' : paqueteId;
  }

  onNavigation(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.layoutService.closeSidebar();
    }
  }

  private getRoleName(id_rol: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'superAdmin',
      2: 'Administrador',
      3: 'Gestor',
      4: 'Tecnico',
      5: 'Cliente',
    };
    return roleMap[id_rol] || 'Cliente';
  }
}