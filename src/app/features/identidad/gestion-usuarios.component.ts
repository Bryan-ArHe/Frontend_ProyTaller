import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { AuthService } from '../../core/services/auth.service';
import {
  UsuarioListado,
  ListadoUsuariosResponse,
  CambiarEstadoUsuarioData,
  AsignarRolData,
} from '../../core/models/usuario.model';
import { UsuarioCreate, UsuarioUpdate, Rol } from '../../core/models/auth.model';
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
        <!-- Header -->
        <div class="mb-8 flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestion de Usuarios</h1>
            <p class="text-gray-600 mt-2">Administra los usuarios y sus permisos</p>
          </div>
          @if (esAdmin()) {
            <button
              (click)="mostrarModalCrear = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              + Crear Usuario
            </button>
          }
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
            <p class="text-red-700">Error: {{ error() }}</p>
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
                    <th class="px-6 py-3 font-semibold text-gray-700">Telefono</th>
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

                      <!-- Telefono -->
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
                                Guardar
                              </button>
                              <button
                                (click)="cancelarRol(usuario.id_usuario)"
                                [disabled]="cambiandoRol[usuario.id_usuario]"
                                class="flex-1 px-2 py-1 text-xs font-semibold rounded bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors disabled:opacity-50"
                              >
                                Cancelar
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
                            Activo
                          </span>
                        } @else if (usuario.estado_cuenta === 'INACTIVO') {
                          <span
                            class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
                          >
                            Inactivo
                          </span>
                        } @else {
                          <span
                            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
                          >
                            Desconocido
                          </span>
                        }
                      </td>

                      <!-- Acciones -->
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
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
                            {{ usuario.estado_cuenta === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                          </button>
                          @if (esAdmin()) {
                            <button
                              (click)="abrirFormularioEditar(usuario)"
                              class="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              (click)="eliminarUsuario(usuario)"
                              [disabled]="eliminando[usuario.id_usuario]"
                              class="px-3 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          }
                        </div>
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
            <p class="text-4xl mb-4">usuarios</p>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p class="text-gray-600">Los usuarios apareceran aqui una vez se registren</p>
          </div>
        }
      </div>

      <!-- Modal: Crear/Editar Usuario -->
      @if (mostrarModalCrear || mostrarModalEditar) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              {{ mostrarModalEditar ? 'Editar Usuario' : 'Crear Usuario' }}
            </h2>

            <form (ngSubmit)="guardarUsuario()" class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  [(ngModel)]="formularioUsuario.email"
                  name="email"
                  [disabled]="mostrarModalEditar"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  [(ngModel)]="formularioUsuario.nombre"
                  name="nombre"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Apellido -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  [(ngModel)]="formularioUsuario.apellido"
                  name="apellido"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Telefono -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                <input
                  type="tel"
                  [(ngModel)]="formularioUsuario.telefono"
                  name="telefono"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <!-- Rol -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  [(ngModel)]="formularioUsuario.id_rol"
                  name="id_rol"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Seleccionar rol...</option>
                  @for (rol of rolesDisponibles(); track rol.id_rol) {
                    <option [value]="rol.id_rol">{{ rol.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Contrasena (solo para crear) -->
              @if (!mostrarModalEditar) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contrasena *</label>
                  <input
                    type="password"
                    [(ngModel)]="formularioUsuario.password"
                    name="password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              }

              <!-- Botones -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  (click)="cerrarFormulario()"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="guardandoUsuario()"
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ mostrarModalEditar ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class GestionUsuariosComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Signals para reactividad
  usuarios = signal<UsuarioListado[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  rolesDisponibles = signal<Rol[]>([]);
  guardandoUsuario = signal(false);

  // Estado de acciones
  cambiadoEstado: { [key: number]: boolean } = {};
  cambiandoRol: { [key: number]: boolean } = {};
  eliminando: { [key: number]: boolean } = {};
  selectRolUsuario: { [key: number]: number } = {};
  rolOriginal: { [key: number]: number } = {};

  // Modal y formulario
  mostrarModalCrear = false;
  mostrarModalEditar = false;
  usuarioEditando: UsuarioListado | null = null;
  formularioUsuario: any = {
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    id_rol: 1,
    password: '',
  };

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  ngAfterViewInit(): void {
    this.usuarios().forEach((u) => {
      this.rolOriginal[u.id_usuario] = u.id_rol;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.usuarioService
      .getTodosLosUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ListadoUsuariosResponse) => {
          this.usuarios.set(response.usuarios);
          response.usuarios.forEach((u) => {
            this.rolOriginal[u.id_usuario] = u.id_rol;
            this.selectRolUsuario[u.id_usuario] = u.id_rol;
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
          this.rolesDisponibles.set([
            { id_rol: 1, nombre: 'admin', descripcion: 'Administrador' },
            { id_rol: 2, nombre: 'tecnico', descripcion: 'Tecnico' },
            { id_rol: 3, nombre: 'cliente', descripcion: 'Cliente' },
            { id_rol: 4, nombre: 'gestor_taller', descripcion: 'Gestor de Taller' },
          ]);
        },
      });
  }

  recargar(): void {
    this.cargarUsuarios();
  }

  cambiarEstado(usuario: UsuarioListado): void {
    const nuevoEstado = usuario.estado_cuenta === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const confirmacion = confirm(
      'Estoy seguro de que deseas ' +
        (nuevoEstado === 'ACTIVO' ? 'ACTIVAR' : 'DESACTIVAR') +
        ' a ' +
        usuario.email +
        '?',
    );

    if (!confirmacion) return;

    this.cambiadoEstado[usuario.id_usuario] = true;
    const data: CambiarEstadoUsuarioData = { estado_cuenta: nuevoEstado };

    this.usuarioService
      .cambiarEstadoUsuario(usuario.id_usuario, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.usuarios().findIndex((u) => u.id_usuario === usuario.id_usuario);
          if (index !== -1) {
            const usuariosActualizados = [...this.usuarios()];
            usuariosActualizados[index].estado_cuenta = nuevoEstado;
            this.usuarios.set(usuariosActualizados);
          }
          this.cambiadoEstado[usuario.id_usuario] = false;
          alert(
            'Usuario ' + (nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado') + ' exitosamente',
          );
        },
        error: (err) => {
          console.error('Error cambiando estado:', err);
          let mensajeError = 'No se pudo cambiar el estado';
          if (Array.isArray(err.detalle)) {
            mensajeError = err.detalle.map((d: any) => d.msg || d).join(', ');
          } else if (typeof err.detalle === 'string') {
            mensajeError = err.detalle;
          }
          alert('Error: ' + mensajeError);
          this.cambiadoEstado[usuario.id_usuario] = false;
        },
      });
  }

  guardarRol(idUsuario: number): void {
    const nuevoIdRol = this.selectRolUsuario[idUsuario];
    console.log('guardarRol - idUsuario:', idUsuario, 'nuevoIdRol:', nuevoIdRol);

    if (!nuevoIdRol || nuevoIdRol === 0) {
      console.log('Rol invalido o no seleccionado');
      return;
    }

    const usuario = this.usuarios().find((u) => u.id_usuario === idUsuario);

    if (!usuario) {
      console.log('Usuario no encontrado');
      return;
    }

    const rol = this.rolesDisponibles().find((r) => r.id_rol === nuevoIdRol);
    const nombreRol = rol?.nombre || 'Rol ' + nuevoIdRol;

    const confirmacion = confirm(
      'Estoy seguro de que deseas asignar el rol ' + nombreRol + ' a ' + usuario.email + '?',
    );

    if (!confirmacion) {
      this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
      return;
    }

    this.cambiandoRol[idUsuario] = true;
    const data: AsignarRolData = { id_rol: nuevoIdRol };

    console.log('Enviando peticion asignarRol:', { idUsuario, data });

    this.usuarioService
      .asignarRol(idUsuario, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.usuarios().findIndex((u) => u.id_usuario === idUsuario);
          if (index !== -1) {
            const usuariosActualizados = [...this.usuarios()];
            usuariosActualizados[index].id_rol = nuevoIdRol;
            usuariosActualizados[index].rol_nombre = nombreRol;
            this.usuarios.set(usuariosActualizados);
            this.rolOriginal[idUsuario] = nuevoIdRol;
          }
          this.cambiandoRol[idUsuario] = false;
          alert('Rol asignado exitosamente a ' + usuario.email);
        },
        error: (err) => {
          console.error('Error asignando rol:', err);
          alert('Error: ' + (err.detalle || 'No se pudo asignar el rol'));
          this.cambiandoRol[idUsuario] = false;
          this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
        },
      });
  }

  cancelarRol(idUsuario: number): void {
    this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
  }

  getRolNombre(idRol: number): string {
    const rol = this.rolesDisponibles().find((r) => r.id_rol === idRol);
    return rol?.nombre || 'Rol ' + idRol;
  }

  esAdmin(): boolean {
    const usuarioActual = this.authService.getCurrentUser();
    return usuarioActual?.id_rol === 1;
  }

  abrirFormularioEditar(usuario: UsuarioListado): void {
    this.usuarioEditando = usuario;
    this.formularioUsuario = {
      email: usuario.email,
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      telefono: usuario.telefono,
      id_rol: usuario.id_rol,
      password: '',
    };
    this.mostrarModalEditar = true;
  }

  cerrarFormulario(): void {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.usuarioEditando = null;
    this.formularioUsuario = {
      email: '',
      nombre: '',
      apellido: '',
      telefono: '',
      id_rol: 1,
      password: '',
    };
  }

  guardarUsuario(): void {
    if (!this.formularioUsuario.email || !this.formularioUsuario.telefono) {
      alert('Email y telefono son obligatorios');
      return;
    }

    if (!this.mostrarModalEditar && !this.formularioUsuario.password) {
      alert('La contrasena es obligatoria para crear un usuario');
      return;
    }

    this.guardandoUsuario.set(true);

    if (this.mostrarModalEditar && this.usuarioEditando) {
      const dataUpdate: UsuarioUpdate = {
        email: this.formularioUsuario.email,
        telefono: this.formularioUsuario.telefono,
      };

      this.usuarioService
        .actualizarUsuario(this.usuarioEditando.id_usuario, dataUpdate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const index = this.usuarios().findIndex(
              (u) => u.id_usuario === this.usuarioEditando!.id_usuario,
            );
            if (index !== -1) {
              const usuariosActualizados = [...this.usuarios()];
              usuariosActualizados[index] = {
                ...usuariosActualizados[index],
                email: this.formularioUsuario.email,
                telefono: this.formularioUsuario.telefono,
                nombre: this.formularioUsuario.nombre,
                apellido: this.formularioUsuario.apellido,
              };
              this.usuarios.set(usuariosActualizados);
            }
            this.guardandoUsuario.set(false);
            alert('Usuario actualizado exitosamente');
            this.cerrarFormulario();
          },
          error: (err) => {
            this.guardandoUsuario.set(false);
            let mensajeError = 'No se pudo actualizar el usuario';
            if (Array.isArray(err.detalle)) {
              mensajeError = err.detalle.map((d: any) => d.msg || d).join(', ');
            } else if (typeof err.detalle === 'string') {
              mensajeError = err.detalle;
            }
            alert('Error: ' + mensajeError);
          },
        });
    } else {
      const dataCreate: UsuarioCreate = {
        email: this.formularioUsuario.email,
        telefono: this.formularioUsuario.telefono,
        nombre: this.formularioUsuario.nombre,
        apellido: this.formularioUsuario.apellido,
        password: this.formularioUsuario.password,
        id_rol: this.formularioUsuario.id_rol,
      };

      this.usuarioService
        .crearUsuario(dataCreate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nuevoUsuario) => {
            const usuariosActualizados = [
              ...this.usuarios(),
              {
                id_usuario: nuevoUsuario.id_usuario,
                email: nuevoUsuario.email,
                telefono: nuevoUsuario.telefono,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                estado_cuenta: nuevoUsuario.estado_cuenta,
                id_rol: nuevoUsuario.id_rol,
              } as UsuarioListado,
            ];
            this.usuarios.set(usuariosActualizados);
            this.guardandoUsuario.set(false);
            alert('Usuario creado exitosamente');
            this.cerrarFormulario();
          },
          error: (err) => {
            this.guardandoUsuario.set(false);
            let mensajeError = 'No se pudo crear el usuario';
            if (Array.isArray(err.detalle)) {
              mensajeError = err.detalle.map((d: any) => d.msg || d).join(', ');
            } else if (typeof err.detalle === 'string') {
              mensajeError = err.detalle;
            }
            alert('Error: ' + mensajeError);
          },
        });
    }
  }

  eliminarUsuario(usuario: UsuarioListado): void {
    const confirmacion = confirm(
      'Estoy seguro de que deseas eliminar a ' +
        usuario.email +
        '? Esta accion no se puede deshacer.',
    );

    if (!confirmacion) return;

    this.eliminando[usuario.id_usuario] = true;

    this.usuarioService
      .eliminarUsuario(usuario.id_usuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const usuariosActualizados = this.usuarios().filter(
            (u) => u.id_usuario !== usuario.id_usuario,
          );
          this.usuarios.set(usuariosActualizados);
          this.eliminando[usuario.id_usuario] = false;
          alert('Usuario eliminado exitosamente');
        },
        error: (err) => {
          this.eliminando[usuario.id_usuario] = false;
          let mensajeError = 'No se pudo eliminar el usuario';
          if (Array.isArray(err.detalle)) {
            mensajeError = err.detalle.map((d: any) => d.msg || d).join(', ');
          } else if (typeof err.detalle === 'string') {
            mensajeError = err.detalle;
          }
          alert('Error: ' + mensajeError);
        },
      });
  }
}
