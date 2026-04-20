import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import {
  UsuarioListado,
  ListadoUsuariosResponse,
  CambiarEstadoUsuarioData,
  AsignarRolData,
} from '../../core/models/usuario.model';
import { Rol } from '../../core/models/auth.model';
import { Subject, takeUntil } from 'rxjs';

interface UsuarioConRolObj extends UsuarioListado {
  rol_nombre?: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Encabezado -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p class="text-gray-600 mt-2">Administra los usuarios y sus permisos</p>
        </div>

        <!-- Estado de carga -->
        @if (cargando()) {
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }

        <!-- Error general -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-700">❌ {{ error() }}</p>
            <button (click)="recargar()" class="mt-2 text-red-600 hover:text-red-700 underline">
              Reintentar
            </button>
          </div>
        }

        <!-- Tabla de usuarios -->
        @if (!cargando() && !error() && usuarios().length > 0) {
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <!-- Encabezado de tabla -->
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p class="text-sm font-semibold text-gray-700">
                Total de usuarios: <span class="text-blue-600">{{ usuarios().length }}</span>
              </p>
            </div>

            <!-- Tabla responsive -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 font-semibold text-gray-700">ID</th>
                    <th class="px-6 py-3 font-semibold text-gray-700">Email / Nombre</th>
                    <th class="px-6 py-3 font-semibold text-gray-700">Teléfono</th>
                    <th class="px-6 py-3 font-semibold text-gray-700">Rol</th>
                    <th class="px-6 py-3 font-semibold text-gray-700">Estado</th>
                    <th class="px-6 py-3 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (usuario of usuarios(); track usuario.id_usuario) {
                    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <!-- ID -->
                      <td class="px-6 py-4 font-mono text-gray-600">{{ usuario.id_usuario }}</td>

                      <!-- Email / Nombre -->
                      <td class="px-6 py-4">
                        <div>
                          <p class="font-semibold text-gray-900">{{ usuario.email }}</p>
                          @if (usuario.nombres || usuario.razon_social) {
                            <p class="text-xs text-gray-600">
                              {{
                                usuario.nombres
                                  ? usuario.nombres + ' ' + (usuario.apellidos || '')
                                  : usuario.razon_social
                              }}
                            </p>
                          }
                        </div>
                      </td>

                      <!-- Teléfono -->
                      <td class="px-6 py-4 text-gray-600">{{ usuario.telefono || '-' }}</td>

                      <!-- Rol (Select) -->
                      <td class="px-6 py-4">
                        <select
                          [(ngModel)]="selectRolUsuario[usuario.id_usuario]"
                          (change)="
                            cambiarRol(usuario.id_usuario, selectRolUsuario[usuario.id_usuario])
                          "
                          [disabled]="cambiandoRol[usuario.id_usuario]"
                          class="border-2 border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-600 disabled:bg-gray-100"
                        >
                          <option value="">Selecciona rol...</option>
                          @for (rol of rolesDisponibles; track rol.id_rol) {
                            <option [value]="rol.id_rol">{{ rol.nombre }}</option>
                          }
                        </select>
                        @if (cambiandoRol[usuario.id_usuario]) {
                          <p class="text-xs text-blue-600 mt-1">Actualizando...</p>
                        }
                      </td>

                      <!-- Estado (Badge) -->
                      <td class="px-6 py-4">
                        @if (usuario.estado_cuenta === 'ACTIVO') {
                          <span
                            class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                          >
                            ✅ Activo
                          </span>
                        } @else if (usuario.estado_cuenta === 'BLOQUEADO') {
                          <span
                            class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
                          >
                            🚫 Bloqueado
                          </span>
                        } @else {
                          <span
                            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
                          >
                            ⏸️ Inactivo
                          </span>
                        }
                      </td>

                      <!-- Acciones -->
                      <td class="px-6 py-4">
                        <button
                          (click)="cambiarEstado(usuario)"
                          [disabled]="cambiadoEstado[usuario.id_usuario]"
                          class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          [ngClass]="{
                            'bg-red-50 hover:bg-red-100 text-red-600':
                              usuario.estado_cuenta === 'ACTIVO',
                            'bg-green-50 hover:bg-green-100 text-green-600':
                              usuario.estado_cuenta === 'BLOQUEADO',
                          }"
                        >
                          @if (cambiadoEstado[usuario.id_usuario]) {
                            <span class="animate-spin">⚙️</span>
                          } @else if (usuario.estado_cuenta === 'ACTIVO') {
                            Bloquear
                          } @else {
                            Activar
                          }
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Sin usuarios -->
        @if (!cargando() && !error() && usuarios().length === 0) {
          <div
            class="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-12 text-center"
          >
            <p class="text-4xl mb-4">👥</p>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p class="text-gray-600">Los usuarios aparecerán aquí una vez se registren</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class GestionUsuariosComponent implements OnInit, OnDestroy {
  private readonly usuarioService = inject(UsuarioService);
  private destroy$ = new Subject<void>();

  // Signals para reactividad
  usuarios = signal<UsuarioListado[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Estado de acciones
  cambiadoEstado: { [key: number]: boolean } = {};
  cambiandoRol: { [key: number]: boolean } = {};
  selectRolUsuario: { [key: number]: number } = {};

  // Roles disponibles (mock, idealmente vendría del backend)
  rolesDisponibles: Rol[] = [
    { id_rol: 1, nombre: 'ADMINISTRADOR', descripcion: 'Acceso total' },
    { id_rol: 2, nombre: 'CLIENTE', descripcion: 'Cliente de plataforma' },
    { id_rol: 3, nombre: 'GESTOR_TALLER', descripcion: 'Gestor de taller' },
    { id_rol: 4, nombre: 'TECNICO', descripcion: 'Técnico' },
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la lista de todos los usuarios
   */
  private cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.usuarioService
      .getTodosLosUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ListadoUsuariosResponse) => {
          this.usuarios.set(response.usuarios);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.error.set(err.detalle || 'Error cargando usuarios');
          this.cargando.set(false);
        },
      });
  }

  /**
   * Recarga la lista de usuarios
   */
  recargar(): void {
    this.cargarUsuarios();
  }

  /**
   * Cambia el estado de un usuario (ACTIVO <-> BLOQUEADO)
   */
  cambiarEstado(usuario: UsuarioListado): void {
    const nuevoEstado = usuario.estado_cuenta === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';

    const confirmacion = confirm(
      `¿Estás seguro de que deseas ${nuevoEstado === 'ACTIVO' ? 'ACTIVAR' : 'BLOQUEAR'} a ${usuario.email}?`,
    );

    if (!confirmacion) return;

    this.cambiadoEstado[usuario.id_usuario] = true;

    const data: CambiarEstadoUsuarioData = { estado_cuenta: nuevoEstado };

    this.usuarioService
      .cambiarEstadoUsuario(usuario.id_usuario, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar en la lista local
          const index = this.usuarios().findIndex((u) => u.id_usuario === usuario.id_usuario);
          if (index !== -1) {
            const usuariosActualizados = [...this.usuarios()];
            usuariosActualizados[index].estado_cuenta = nuevoEstado;
            this.usuarios.set(usuariosActualizados);
          }
          this.cambiadoEstado[usuario.id_usuario] = false;
          alert(`✅ Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'bloqueado'} exitosamente`);
        },
        error: (err) => {
          console.error('Error cambiando estado:', err);
          alert(`❌ Error: ${err.detalle || 'No se pudo cambiar el estado'}`);
          this.cambiadoEstado[usuario.id_usuario] = false;
        },
      });
  }

  /**
   * Cambia el rol de un usuario
   */
  cambiarRol(idUsuario: number, idRol: number): void {
    if (!idRol) return;

    const rol = this.rolesDisponibles.find((r) => r.id_rol === idRol);
    const usuario = this.usuarios().find((u) => u.id_usuario === idUsuario);

    if (!usuario || !rol) return;

    const confirmacion = confirm(
      `¿Estás seguro de que deseas asignar el rol "${rol.nombre}" a ${usuario.email}?`,
    );

    if (!confirmacion) {
      this.selectRolUsuario[idUsuario] = 0;
      return;
    }

    this.cambiandoRol[idUsuario] = true;

    const data: AsignarRolData = { id_rol: idRol };

    this.usuarioService
      .asignarRol(idUsuario, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar en la lista local
          const index = this.usuarios().findIndex((u) => u.id_usuario === idUsuario);
          if (index !== -1) {
            const usuariosActualizados = [...this.usuarios()];
            usuariosActualizados[index].rol_nombre = rol.nombre;
            this.usuarios.set(usuariosActualizados);
          }
          this.cambiandoRol[idUsuario] = false;
          this.selectRolUsuario[idUsuario] = 0;
          alert(`✅ Rol asignado exitosamente`);
        },
        error: (err) => {
          console.error('Error asignando rol:', err);
          alert(`❌ Error: ${err.detalle || 'No se pudo asignar el rol'}`);
          this.cambiandoRol[idUsuario] = false;
          this.selectRolUsuario[idUsuario] = 0;
        },
      });
  }
}
