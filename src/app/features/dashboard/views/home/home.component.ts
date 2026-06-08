import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

interface Card {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  roles: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 antialiased text-slate-200">
      <!-- Título y subtítulo Modernizados -->
      <div>
        <h1 class="text-4xl font-extrabold text-white tracking-tight">Panel de Control</h1>
        <p class="text-slate-400 mt-2 text-sm">Gestión centralizada y monitorización del ecosistema Multi-tenant</p>
      </div>

      <!-- Tarjetas de estadísticas rápidas (Estilo Dark Inmersivo) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of quickStats; track stat.title) {
          <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 shadow-xl backdrop-blur-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">{{ stat.title }}</p>
                <p class="text-3xl font-black text-white mt-2 tracking-tight">{{ stat.value }}</p>
              </div>
              <span class="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">{{ stat.icon }}</span>
            </div>
            <p class="text-xs text-indigo-400 font-medium mt-3 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              {{ stat.subtitle }}
            </p>
          </div>
        }
      </div>

      <!-- Tarjetas de acciones rápidas (Con consistencia de Roles) -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-6 tracking-tight">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (card of visibleCards; track card.title) {
            <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl hover:border-slate-700/80 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 shadow-lg group">
              <div [ngClass]="'h-1.5 w-full ' + card.color"></div>
              <div class="p-6">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-3xl group-hover:scale-110 transition-transform duration-200">{{ card.icon }}</span>
                  <h3 class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{ card.title }}</h3>
                </div>
                <p class="text-slate-400 text-xs mb-5 h-10 line-clamp-2 leading-relaxed">{{ card.description }}</p>
                <button class="w-full bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 uppercase tracking-wider">
                  {{ card.action }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Panel de Información de Cuenta Contextualizado -->
      <div class="bg-gradient-to-r from-slate-900/80 to-slate-950/80 border border-slate-800/80 rounded-2xl p-8 shadow-xl">
        <h2 class="text-lg font-bold text-white mb-4 tracking-tight">Información de Conexión</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Identificador (Email)</p>
            <p class="font-medium text-slate-200 mt-1 text-sm overflow-hidden text-overflow-ellipsis white-space-nowrap">{{ userEmail }}</p>
          </div>
          <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Terminal Telefónica</p>
            <p class="font-medium text-slate-200 mt-1 text-sm">{{ userPhone || 'No registrado' }}</p>
          </div>
          <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Estado Operativo</p>
            <span class="inline-flex items-center gap-1.5 font-bold text-emerald-400 mt-1 text-sm uppercase tracking-wide">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ userStatus || 'ACTIVO' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  userEmail = '';
  userPhone = '';
  userStatus = '';
  userRole = '';

  // 🌟 CONFIGURACIÓN ROBUSTA: Mapeado exactamente a las cadenas sembradas por PostgreSQL
  readonly allCards: Card[] = [
    {
      title: 'Mis Vehículos',
      description: 'Gestiona tus unidades motorizadas registradas para auxilio técnico.',
      icon: '🚙',
      color: 'bg-sky-500',
      action: 'Ver vehículos',
      roles: ['cliente'],
    },
    {
      title: 'Solicitar Auxilio',
      description: 'Dispara una alerta de emergencia geolocalizada con asistencia de IA.',
      icon: '🆘',
      color: 'bg-rose-500',
      action: 'Nueva solicitud',
      roles: ['cliente'],
    },
    {
      title: 'Mis Solicitudes',
      description: 'Inspecciona el progreso de tus reportes activos o el historial histórico.',
      icon: '📋',
      color: 'bg-amber-500',
      action: 'Ver historial',
      roles: ['cliente'],
    },
    {
      title: 'Órdenes de Trabajo',
      description: 'Gestiona la cola de reparaciones operativas de la sucursal asignada.',
      icon: '⚙️',
      color: 'bg-violet-500',
      action: 'Ver órdenes',
      roles: ['gestor', 'tecnico'],
    },
    {
      title: 'Gestión de Talleres',
      description: 'Controla el mapa general de sucursales, infraestructura PostGIS y personal.',
      icon: '⚡',
      color: 'bg-emerald-500',
      action: 'Administrar Sucursales',
      roles: ['administrador'],
    },
    {
      title: 'Usuarios del Sistema',
      description: 'Audita y controla las credenciales de acceso de operadores y clientes.',
      icon: '👥',
      color: 'bg-indigo-500',
      action: 'Gestionar Personal',
      roles: ['administrador'],
    },
  ];

  readonly quickStats = [
    { title: 'Solicitudes Activas', value: '3', icon: '📍', subtitle: 'En proceso de triaje' },
    { title: 'Establecimientos', value: '4', icon: '🏢', subtitle: 'Sucursales PostGIS' },
    { title: 'Personal Técnico', value: '8', icon: '🔧', subtitle: 'Operadores en línea' },
    { title: 'Tiempo Promedio', value: '15m', icon: '⏱️', subtitle: 'Garantía SLA de respuesta' },
  ];

  /**
   * Filtra las tarjetas basándose estrictamente en el rol computado en minúsculas
   */
  get visibleCards(): Card[] {
    if (!this.userRole) return [];
    const roleLower = this.userRole.toLowerCase();
    return this.allCards.filter((card) => card.roles.includes(roleLower));
  }

  constructor() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userEmail = user.email;
        this.userPhone = user.telefono;
        this.userStatus = user.estado_cuenta;
        this.userRole = this.getRoleName(user.id_rol);
      }
    });
  }

  /**
   * Mapeo unificado estricto (Alineado con reset_db.py y la arquitectura Multi-tenant)
   */
  private getRoleName(id_rol: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'superAdmin',
      2: 'Administrador',
      3: 'Gestor',         // 🌟 CORREGIDO: Consistencia total con la base de datos
      4: 'Tecnico',
      5: 'Cliente',
    };
    return roleMap[id_rol] || 'Cliente';
  }
}