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
    <div class="space-y-8">
      <!-- Título y subtítulo -->
      <div>
        <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Gestión centralizada de emergencias vehiculares</p>
      </div>

      <!-- Tarjetas de estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of quickStats; track stat.title) {
          <div
            class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">{{ stat.title }}</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ stat.value }}</p>
              </div>
              <span class="text-4xl">{{ stat.icon }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-3">{{ stat.subtitle }}</p>
          </div>
        }
      </div>

      <!-- Tarjetas de acciones rápidas -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (card of visibleCards; track card.title) {
            <div
              class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-1"
            >
              <div [ngClass]="'h-2 ' + card.color"></div>
              <div class="p-6">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-3xl">{{ card.icon }}</span>
                  <h3 class="font-bold text-gray-900">{{ card.title }}</h3>
                </div>
                <p class="text-gray-600 text-sm mb-4">{{ card.description }}</p>
                <button
                  class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg transition-all duration-200"
                >
                  {{ card.action }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Información de cuenta -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Información de tu Cuenta</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-gray-600 text-sm">Email</p>
            <p class="font-semibold text-gray-900">{{ userEmail }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Teléfono</p>
            <p class="font-semibold text-gray-900">{{ userPhone }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Estado de Cuenta</p>
            <p class="font-semibold text-green-600">{{ userStatus }}</p>
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

  readonly allCards: Card[] = [
    {
      title: 'Mis Vehículos',
      description: 'Gestiona tus vehículos registrados',
      icon: '🚙',
      color: 'bg-blue-300',
      action: 'Ver vehículos',
      roles: ['usuario'],
    },
    {
      title: 'Solicitar Auxilio',
      description: 'Solicita ayuda en caso de emergencia',
      icon: '🆘',
      color: 'bg-red-300',
      action: 'Nueva solicitud',
      roles: ['usuario'],
    },
    {
      title: 'Mis Solicitudes',
      description: 'Revisa el historial de tus solicitudes',
      icon: '📋',
      color: 'bg-yellow-300',
      action: 'Ver historial',
      roles: ['usuario'],
    },
    {
      title: 'Órdenes Activas',
      description: 'Gestiona tus órdenes de trabajo',
      icon: '⚙️',
      color: 'bg-purple-300',
      action: 'Ver órdenes',
      roles: ['operador', 'tecnico'],
    },
    {
      title: 'Gestión Global',
      description: 'Supervisa todas las operaciones',
      icon: '⚡',
      color: 'bg-green-300',
      action: 'Acceder',
      roles: ['admin'],
    },
    {
      title: 'Usuarios',
      description: 'Administra usuarios del sistema',
      icon: '👥',
      color: 'bg-indigo-300',
      action: 'Gestionar',
      roles: ['admin'],
    },
  ];

  readonly quickStats = [
    { title: 'Solicitudes Activas', value: '3', icon: '📍', subtitle: 'En progreso' },
    { title: 'Vehículos', value: '2', icon: '🚗', subtitle: 'Registrados' },
    { title: 'Técnicos Disponibles', value: '5', icon: '🔧', subtitle: 'En línea' },
    { title: 'Tiempo Promedio', value: '15m', icon: '⏱️', subtitle: 'De respuesta' },
  ];

  get visibleCards(): Card[] {
    const userRole = this.userRole.toLowerCase();
    return this.allCards.filter((card) => card.roles.includes(userRole));
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
