import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
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
                          @if (usuario.nombre || usuario.razon_social) {
                            <p class="text-xs text-gray-600">
                              {{
                                usuario.nombre
                                  ? usuario.nombre + ' ' + (usuario.apellido || '')
                                  : usuario.razon_social
                              }}
                            </p>
                          }
                        </div>
                      </td>

                      <!-- Teléfono -->
                      <td class="px-6 py-4 text-gray-600">{{ usuario.telefono || '-' }}</td>

                      <!-- Rol (Select + Botones) -->
                      <td class="px-6 py-4">
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <select
                              [(ngModel)]="selectRolUsuario[usuario.id_usuario]"
                              [disabled]="cambiandoRol[usuario.id_usuario]"
                              class="border-2 border-gray-300 rounded-lg px-3 py-1 text-sm flex-1 focus:outline-none focus:border-blue-600 disabled:bg-gray-100"
                            >
                              @for (rol of rolesDisponibles(); track rol.id_rol) {
                                <option [value]="rol.id_rol">{{ rol.nombre }}</option>
                              }
                            </select>
                          
                          </div>

                          @if (
                            selectRolUsuario[usuario.id_usuario] &&
                            selectRolUsuario[usuario.id_usuario] !== rolOriginal[usuario.id_usuario]
                          ) {
                            <div class="flex gap-2">
                              <button
                                (click)="guardarRol(usuario.id_usuario)"
                                [disabled]="cambiandoRol[usuario.id_usuario]"
                                class="flex-1 px-2 py-1 text-xs font-semibold rounded bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                              >
                                @if (cambiandoRol[usuario.id_usuario]) {
                                  <span>⚙️</span>
                                } @else {
                                  ✅ Guardar
                                }
                              </button>
                              <button
                                (click)="cancelarRol(usuario.id_usuario)"
                                [disabled]="cambiandoRol[usuario.id_usuario]"
                                class="flex-1 px-2 py-1 text-xs font-semibold rounded bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors disabled:opacity-50"
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          }
                        </div>
                      </td>

                      <!-- Estado (Badge) -->
                      <td class="px-6 py-4">
                        @if (usuario.estado_cuenta === 'ACTIVO') {
                          <span
                            class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                          >
                            ✅ Activo
                          </span>
                        } @else if (usuario.estado_cuenta === 'INACTIVO') {
                          <span
                            class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
                          >
                            ⏸️ Inactivo
                          </span>
                        } @else {
                          <span
                            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
                          >
                            ❓ Desconocido
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
                              usuario.estado_cuenta === 'INACTIVO',
                          }"
                        >
                          @if (cambiadoEstado[usuario.id_usuario]) {
                            <span class="animate-spin">⚙️</span>
                          } @else if (usuario.estado_cuenta === 'ACTIVO') {
                            Desactivar
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
export class GestionUsuariosComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private destroy$ = new Subject<void>();

  // Signals para reactividad
  usuarios = signal<UsuarioListado[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  rolesDisponibles = signal<Rol[]>([]);

  // Estado de acciones
  cambiadoEstado: { [key: number]: boolean } = {};
  cambiandoRol: { [key: number]: boolean } = {};
  selectRolUsuario: { [key: number]: number } = {};
  rolOriginal: { [key: number]: number } = {}; // Trackea el rol original

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  ngAfterViewInit(): void {
    // Inicializar roles originales después de cargar usuarios
    this.usuarios().forEach((u) => {
      this.rolOriginal[u.id_usuario] = u.id_rol;
    });
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
          // Inicializar roles originales y selectRolUsuario con el rol actual
          response.usuarios.forEach((u) => {
            this.rolOriginal[u.id_usuario] = u.id_rol;
            this.selectRolUsuario[u.id_usuario] = u.id_rol; // Inicializar con el rol actual
          });
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
   * Carga los roles disponibles desde el backend
   */
  private cargarRoles(): void {
    this.rolService
      .getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          console.log('Roles cargados:', roles);
          this.rolesDisponibles.set(roles);
        },
        error: (err) => {
          console.error('Error cargando roles:', err);
          // Usar valores por defecto si falla la carga
          this.rolesDisponibles.set([
            { id_rol: 1, nombre: 'admin', descripcion: 'Administrador' },
            { id_rol: 2, nombre: 'tecnico', descripcion: 'Técnico' },
            { id_rol: 3, nombre: 'cliente', descripcion: 'Cliente' },
            { id_rol: 4, nombre: 'gestor_taller', descripcion: 'Gestor de Taller' },
          ]);
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
   * Cambia el estado de un usuario (ACTIVO <-> INACTIVO)
   */
  cambiarEstado(usuario: UsuarioListado): void {
    const nuevoEstado = usuario.estado_cuenta === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    const confirmacion = confirm(
      `¿Estás seguro de que deseas ${nuevoEstado === 'ACTIVO' ? 'ACTIVAR' : 'DESACTIVAR'} a ${usuario.email}?`,
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
          alert(`✅ Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`);
        },
        error: (err) => {
          console.error('Error cambiando estado:', err);
          let mensajeError = 'No se pudo cambiar el estado';
          if (Array.isArray(err.detalle)) {
            mensajeError = err.detalle.map((d: any) => d.msg || d).join(', ');
          } else if (typeof err.detalle === 'string') {
            mensajeError = err.detalle;
          }
          console.error('Mensaje de error detallado:', mensajeError);
          alert(`❌ Error: ${mensajeError}`);
          this.cambiadoEstado[usuario.id_usuario] = false;
        },
      });
  }

  /**
   * Guarda el cambio de rol
   */
  guardarRol(idUsuario: number): void {
    const nuevoIdRol = this.selectRolUsuario[idUsuario];
    console.log('guardarRol - idUsuario:', idUsuario, 'nuevoIdRol:', nuevoIdRol);

    if (!nuevoIdRol || nuevoIdRol === 0) {
      console.log('Rol inválido o no seleccionado');
      return;
    }

    const usuario = this.usuarios().find((u) => u.id_usuario === idUsuario);

    if (!usuario) {
      console.log('Usuario no encontrado');
      return;
    }

    // Obtener nombre del rol desde rolesDisponibles() o usar el ID como fallback
    const rol = this.rolesDisponibles().find((r) => r.id_rol === nuevoIdRol);
    const nombreRol = rol?.nombre || `Rol #${nuevoIdRol}`;

    const confirmacion = confirm(
      `¿Estás seguro de que deseas asignar el rol "${nombreRol}" a ${usuario.email}?`,
    );

    if (!confirmacion) {
      this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
      return;
    }

    this.cambiandoRol[idUsuario] = true;
    const data: AsignarRolData = { id_rol: nuevoIdRol };

    console.log('Enviando petición asignarRol:', { idUsuario, data });

    this.usuarioService
      .asignarRol(idUsuario, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar en la lista local
          const index = this.usuarios().findIndex((u) => u.id_usuario === idUsuario);
          if (index !== -1) {
            const usuariosActualizados = [...this.usuarios()];
            usuariosActualizados[index].id_rol = nuevoIdRol;
            usuariosActualizados[index].rol_nombre = nombreRol;
            this.usuarios.set(usuariosActualizados);
            // Actualizar rol original
            this.rolOriginal[idUsuario] = nuevoIdRol;
          }
          this.cambiandoRol[idUsuario] = false;
          alert(`✅ Rol asignado exitosamente a ${usuario.email}`);
        },
        error: (err) => {
          console.error('Error asignando rol:', err);
          alert(`❌ Error: ${err.detalle || 'No se pudo asignar el rol'}`);
          this.cambiandoRol[idUsuario] = false;
          // Revertir al rol original
          this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
        },
      });
  }

  /**
   * Cancela el cambio de rol
   */
  cancelarRol(idUsuario: number): void {
    this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
  }

  /**
   * Obtiene el nombre del rol dado su ID
   */
  getRolNombre(idRol: number): string {
    const rol = this.rolesDisponibles().find((r) => r.id_rol === idRol);
    return rol?.nombre || `Rol #${idRol}`;
  }
}
