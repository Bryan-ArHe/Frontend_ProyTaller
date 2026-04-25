import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BitacoraService } from '../../../../core/services/bitacora.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Bitacora } from '../../../../core/models/bitacora.model';

// Tipo local para mantener compatibilidad
type BitacoraLog = Bitacora;

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-8">
      <!-- Encabezado -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">📋 Bitácora de Auditoría</h1>
        <p class="text-gray-600">Registro de actividades y operaciones en el sistema</p>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow mb-6 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por evento:</label>
            <select
              [(ngModel)]="filtroEvento"
              (change)="aplicarFiltros()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los eventos</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
              <option value="READ">Leer</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por usuario:</label>
            <input
              type="text"
              [(ngModel)]="filtroUsuario"
              (change)="aplicarFiltros()"
              placeholder="Buscar usuario..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por recurso:</label>
            <input
              type="text"
              [(ngModel)]="filtroRecurso"
              (change)="aplicarFiltros()"
              placeholder="Buscar recurso..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Tabla de logs -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        @if (loading) {
          <div class="p-8 text-center">
            <p class="text-gray-600">Cargando bitácora...</p>
          </div>
        } @else if (logsActuales.length === 0) {
          <div class="p-8 text-center">
            <p class="text-gray-600">No hay registros disponibles</p>
          </div>
        } @else {
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Evento</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Recurso</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">IP</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dispositivo</th>
              </tr>
            </thead>
            <tbody>
              @for (log of logsActuales; track log.id_bitacora) {
                <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-700">
                    {{ formatearFecha(log.fecha) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    <span class="font-medium">{{ log.nombre_usuario }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span
                      [ngClass]="getBadgeClass(log.evento)"
                      class="px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {{ log.evento }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">{{ log.recurso }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ log.accion }}</td>
                  <td class="px-6 py-4 text-xs text-gray-500 font-mono">{{ log.ip }}</td>
                  <td class="px-6 py-4 text-sm text-gray-700">{{ log.dispositivo || '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Información -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>Total de registros: {{ logs.length }}</p>
      </div>
    </div>
  `,
  styles: [],
})
export class BitacoraComponent implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private authService = inject(AuthService);

  logs: BitacoraLog[] = [];
  logsActuales: BitacoraLog[] = [];
  loading = false;
  filtroEvento = '';
  filtroUsuario = '';
  filtroRecurso = '';

  ngOnInit() {
    this.cargarBitacora();
  }

  cargarBitacora() {
    this.loading = true;
    this.bitacoraService.getLogs().subscribe({
      next: (data) => {
        this.logs = data || [];
        this.logsActuales = [...this.logs];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando bitácora:', error);
        this.loading = false;
        this.logs = [];
        this.logsActuales = [];
      },
    });
  }

  aplicarFiltros() {
    this.logsActuales = this.logs.filter((log) => {
      const coincideEvento =
        !this.filtroEvento || log.evento.toUpperCase() === this.filtroEvento.toUpperCase();
      const coincideUsuario =
        !this.filtroUsuario ||
        log.nombre_usuario.toLowerCase().includes(this.filtroUsuario.toLowerCase());
      const coincideRecurso =
        !this.filtroRecurso || log.recurso.toLowerCase().includes(this.filtroRecurso.toLowerCase());

      return coincideEvento && coincideUsuario && coincideRecurso;
    });
  }

  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleString('es-ES');
    } catch {
      return fecha;
    }
  }

  getBadgeClass(evento: string): string {
    const clases: { [key: string]: string } = {
      LOGIN: 'bg-green-100 text-green-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      CREATE: 'bg-blue-100 text-blue-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      READ: 'bg-purple-100 text-purple-800',
    };
    return clases[evento.toUpperCase()] || 'bg-gray-100 text-gray-800';
  }
}
