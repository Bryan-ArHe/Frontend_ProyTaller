import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
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

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-2 sm:p-4 antialiased text-slate-200">
      <div class="max-w-7xl mx-auto">
        
        <!-- 🏢 CABECERA DEL PANEL -->
        <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Gestión de Usuarios</h1>
            <p class="text-slate-400 mt-1 text-sm">Control de accesos del Tenant y administración de privilegios RBAC</p>
          </div>
          @if (esAdmin()) {
            <button
              (click)="mostrarModalCrear = true"
              class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-600/20"
            >
              ➕ Registrar Usuario
            </button>
          }
        </div>

        <!-- 🔄 ESTADO DE CARGA UNIFICADO -->
        @if (cargando()) {
          <div class="flex justify-center py-16">
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              <p class="text-slate-400 text-sm">Sincronizando base de datos...</p>
            </div>
          </div>
        }

        <!-- ⚠️ MANEJO DE EXCEPCIONES -->
        @if (error()) {
          <div class="bg-rose-950/30 border border-rose-900/40 rounded-2xl p-5 mb-6">
            <p class="text-rose-400 text-sm font-medium">💥 Error del Servidor: {{ error() }}</p>
            <button (click)="recargar()" class="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider underline">
              Forzar Reintento
            </button>
          </div>
        }

        <!-- 📊 TABLA DE CONTROL OPERATIVO -->
        @if (!cargando() && !error() && usuarios().length > 0) {
          <div class="bg-slate-900/60 rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden backdrop-blur-sm">
            
            <div class="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Personal Registrado en el Tenant: <span class="text-indigo-400 font-bold font-mono text-sm">{{ usuarios().length }}</span>
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left border-collapse">
                <thead>
                  <tr class="bg-slate-950/80 text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-800/60">
                    <th class="px-6 py-4">ID</th>
                    <th class="px-6 py-4">Email / Identidad</th>
                    <th class="px-6 py-4">Teléfono</th>
                    <th class="px-6 py-4">Rol Asignado</th>
                    <th class="px-6 py-4">Estado</th>
                    <th class="px-6 py-4 text-center">Acciones Perimetrales</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 text-slate-300">
                  @for (usuario of usuarios(); track usuario.id_usuario) {
                    <tr class="hover:bg-slate-900/40 transition-colors">
                      
                      <!-- ID de Usuario -->
                      <td class="px-6 py-4 font-mono text-xs text-slate-500">#{{ usuario.id_usuario }}</td>

                      <!-- Email e Identidad Física -->
                      <td class="px-6 py-4">
                        <div class="flex flex-col">
                          <p class="font-semibold text-white text-sm">{{ usuario.email }}</p>
                          @if (usuario.nombre || usuario.razon_social) {
                            <p class="text-xs text-slate-400 mt-0.5">
                              👤 {{ usuario.nombre ? usuario.nombre + ' ' + (usuario.apellido || '') : usuario.razon_social }}
                            </p>
                          }
                        </div>
                      </td>

                      <!-- Terminal Telefónica -->
                      <td class="px-6 py-4 text-slate-400 font-mono text-xs">{{ usuario.telefono || '-' }}</td>

                      <!-- Gestión de Rol (Select Inmersivo + Acciones) -->
                      <td class="px-6 py-4 min-w-[200px]">
                        <div class="flex flex-col gap-1.5">
                          <select
                            [(ngModel)]="selectRolUsuario[usuario.id_usuario]"
                            [disabled]="cambiandoRol[usuario.id_usuario]"
                            class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            @for (rol of rolesDisponibles(); track rol.id_rol) {
                              <option [value]="rol.id_rol">{{ rol.nombre }}</option>
                            }
                          </select>

                          <!-- Botonera Condicional de Confirmación de Rol -->
                          @if (
                            selectRolUsuario[usuario.id_usuario] &&
                            selectRolUsuario[usuario.id_usuario] !== rolOriginal[usuario.id_usuario]
                          ) {
                            <div class="flex gap-2 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                (click)="guardarRol(usuario.id_usuario)"
                                [disabled]="cambiandoRol[usuario.id_usuario]"
                                class="flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40"
                              >
                                Guardar
                              </button>
                              <button
                                (click)="cancelarRol(usuario.id_usuario)"
                                [disabled]="cambiandoRol[usuario.id_usuario]"
                                class="flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
                              >
                                Cancelar
                              </button>
                            </div>
                          }
                        </div>
                      </td>

                      <!-- Estado Operativo de Cuenta -->
                      <td class="px-6 py-4">
                        <span
                          [ngClass]="{
                            'bg-emerald-950/40 text-emerald-400 border-emerald-800/50': usuario.estado_cuenta === 'ACTIVO',
                            'bg-rose-950/40 text-rose-400 border-rose-800/50': usuario.estado_cuenta === 'INACTIVO'
                          }"
                          class="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border"
                        >
                          {{ usuario.estado_cuenta === 'ACTIVO' ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>

                      <!-- Panel de Acciones -->
                      <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <button
                            (click)="cambiarEstado(usuario)"
                            [disabled]="cambiadoEstado[usuario.id_usuario]"
                            [ngClass]="{
                              'border-rose-900/50 hover:bg-rose-950/30 text-rose-400': usuario.estado_cuenta === 'ACTIVO',
                              'border-emerald-900/50 hover:bg-emerald-950/30 text-emerald-400': usuario.estado_cuenta === 'INACTIVO'
                            }"
                            class="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-950 border border-slate-800 transition-all disabled:opacity-30"
                          >
                            {{ usuario.estado_cuenta === 'ACTIVO' ? '🚫 Desactivar' : '🟢 Activar' }}
                          </button>
                          
                          @if (esAdmin()) {
                            <button
                              (click)="abrirFormularioEditar(usuario)"
                              class="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all"
                            >
                              ⚙️ Editar
                            </button>
                            <button
                              (click)="eliminarUsuario(usuario)"
                              [disabled]="eliminando[usuario.id_usuario]"
                              class="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition-all disabled:opacity-30"
                            >
                              🗑️ Eliminar
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

        <!-- 📭 PANEL DE REGISTROS VACÍOS -->
        @if (!cargando() && !error() && usuarios().length === 0) {
          <div class="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <p class="text-4xl mb-3filter drop-shadow-md">👥</p>
            <h3 class="text-lg font-bold text-white mb-1">No se detectan usuarios en el Tenant</h3>
            <p class="text-slate-500 text-sm">Los operadores y clientes dados de alta se listarán en esta matriz de control.</p>
          </div>
        }
      </div>

      <!-- ========================================================================= -->
      <!-- 🌟 MODAL FORMULARIO: CREACIÓN / EDICIÓN DIRECTA                           -->
      <!-- ========================================================================= -->
      @if (mostrarModalCrear || mostrarModalEditar) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 class="text-xl font-bold text-white mb-5 tracking-tight">
              {{ mostrarModalEditar ? '⚙️ Modificar Credenciales' : '🚀 Dar de Alta Usuario' }}
            </h2>

            <form (ngSubmit)="guardarUsuario()" class="space-y-4">
              <!-- Campo: Correo Electrónico -->
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  [(ngModel)]="formularioUsuario.email"
                  name="email"
                  [disabled]="mostrarModalEditar"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors font-mono disabled:opacity-40"
                  required
                />
              </div>

              <!-- Fila: Nombre y Apellido -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre</label>
                  <input
                    type="text"
                    [(ngModel)]="formularioUsuario.nombre"
                    name="nombre"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apellido</label>
                  <input
                    type="text"
                    [(ngModel)]="formularioUsuario.apellido"
                    name="apellido"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <!-- Campo: Teléfono -->
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono *</label>
                <input
                  type="tel"
                  [(ngModel)]="formularioUsuario.telefono"
                  name="telefono"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors font-mono"
                  placeholder="7XXXXXXX"
                  required
                />
              </div>

              <!-- Campo: Selección de Rol -->
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rol Institucional *</label>
                <select
                  [(ngModel)]="formularioUsuario.id_rol"
                  name="id_rol"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors cursor-pointer"
                  required
                >
                  <option value="" disabled>Seleccionar rol institucional...</option>
                  @for (rol of rolesDisponibles(); track rol.id_rol) {
                    <option [value]="rol.id_rol">{{ rol.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Campo: Contraseña (Solo para nuevos registros) -->
              @if (!mostrarModalEditar) {
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña de Acceso *</label>
                  <input
                    type="password"
                    [(ngModel)]="formularioUsuario.password"
                    name="password"
                    class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              }

              <!-- Botonera del Diálogo -->
              <div class="flex gap-3 pt-4 border-t border-slate-800/80 mt-5">
                <button
                  type="button"
                  (click)="cerrarFormulario()"
                  class="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="guardandoUsuario()"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-600/20 disabled:opacity-40"
                >
                  {{ mostrarModalEditar ? 'Actualizar' : 'Confirmar Alta' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class GestionUsuariosComponent implements OnInit, OnDestroy {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  usuarios = signal<UsuarioListado[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  rolesDisponibles = signal<Rol[]>([]);
  guardandoUsuario = signal(false);

  cambiadoEstado: { [key: number]: boolean } = {};
  cambiandoRol: { [key: number]: boolean } = {};
  eliminando: { [key: number]: boolean } = {};
  selectRolUsuario: { [key: number]: number } = {};
  rolOriginal: { [key: number]: number } = {};

  mostrarModalCrear = false;
  mostrarModalEditar = false;
  usuarioEditando: UsuarioListado | null = null;
  formularioUsuario: any = {
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    id_rol: 2, // 🌟 CORREGIDO: El valor por defecto al abrir debe ser 2 (Administrador corporativo)
    password: '',
  };

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
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
          // 🌟 CORREGIDO: Mapeamos el estado de los roles originales aquí, de forma segura en el flujo asíncrono
          response.usuarios.forEach((u) => {
            this.rolOriginal[u.id_usuario] = u.id_rol;
            this.selectRolUsuario[u.id_usuario] = u.id_rol;
          });
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.error.set(err.detalle || 'Error al conectar con el servidor.');
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
          this.rolesDisponibles.set(roles);
        },
        error: (err) => {
          console.error('Error cargando roles, activando fallback corporativo unificado:', err);
          // 🌟 CORREGIDO: Matriz de roles homologada estrictamente con el backend Multi-tenant
          this.rolesDisponibles.set([
            { id_rol: 1, nombre: 'superAdmin', descripcion: 'Dueño de la Infraestructura SaaS' },
            { id_rol: 2, nombre: 'Administrador', descripcion: 'Director General de la Franquicia' },
            { id_rol: 3, nombre: 'Gestor', descripcion: 'Operador de Sucursal / Taller Técnico' },
            { id_rol: 4, nombre: 'Tecnico', descripcion: 'Mecánico de Auxilio en Ruta' },
            { id_rol: 5, nombre: 'Cliente', descripcion: 'Usuario Conductor Final' },
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
      `¿Está seguro de que desea ${nuevoEstado === 'ACTIVO' ? 'ACTIVAR' : 'DESACTIVAR'} al usuario ${usuario.email}?`
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
          alert(`✅ El usuario ha sido ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} con éxito.`);
        },
        error: (err) => {
          console.error('Error cambiando estado:', err);
          alert('Error: No se pudo modificar el estado del usuario.');
          this.cambiadoEstado[usuario.id_usuario] = false;
        },
      });
  }

  guardarRol(idUsuario: number): void {
    const nuevoIdRol = Number(this.selectRolUsuario[idUsuario]);

    if (!nuevoIdRol || nuevoIdRol === 0) return;

    const usuario = this.usuarios().find((u) => u.id_usuario === idUsuario);
    if (!usuario) return;

    const rol = this.rolesDisponibles().find((r) => r.id_rol === nuevoIdRol);
    const nombreRol = rol?.nombre || 'Rol ' + nuevoIdRol;

    const confirmacion = confirm(`¿Confirma la reasignación de privilegios al rol [${nombreRol}] para ${usuario.email}?`);

    if (!confirmacion) {
      this.selectRolUsuario[idUsuario] = this.rolOriginal[idUsuario];
      return;
    }

    this.cambiandoRol[idUsuario] = true;
    const data: AsignarRolData = { id_rol: nuevoIdRol };

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
          alert(`✅ Rol [${nombreRol}] asignado correctamente.`);
        },
        error: (err) => {
          console.error('Error asignando rol:', err);
          alert('Error: El perímetro de seguridad rechazó el cambio de rol.');
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
    // 🌟 CORREGIDO: Validamos contra ID 2 (Administrador corporativo de la franquicia) o ID 1 (superAdmin)
    return usuarioActual?.id_rol === 2 || usuarioActual?.id_rol === 1;
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
      id_rol: 2,
      password: '',
    };
  }

  guardarUsuario(): void {
    if (!this.formularioUsuario.email || !this.formularioUsuario.telefono) {
      alert('Email y teléfono son campos obligatorios.');
      return;
    }

    if (!this.mostrarModalEditar && !this.formularioUsuario.password) {
      alert('La contraseña de acceso es requerida para dar de alta.');
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
            const index = this.usuarios().findIndex((u) => u.id_usuario === this.usuarioEditando!.id_usuario);
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
            alert('✅ Registro actualizado de forma exitosa.');
            this.cerrarFormulario();
          },
          error: (err) => {
            this.guardandoUsuario.set(false);
            alert('Error al intentar modificar el registro.');
          },
        });
    } else {
      const dataCreate: UsuarioCreate = {
        email: this.formularioUsuario.email,
        telefono: this.formularioUsuario.telefono,
        nombre: this.formularioUsuario.nombre,
        apellido: this.formularioUsuario.apellido,
        password: this.formularioUsuario.password,
        id_rol: Number(this.formularioUsuario.id_rol),
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
            alert('✅ Operador dado de alta en el sistema.');
            this.cerrarFormulario();
          },
          error: (err) => {
            this.guardandoUsuario.set(false);
            alert('Error: No se pudo procesar el alta en el servidor.');
          },
        });
    }
  }

  eliminarUsuario(usuario: UsuarioListado): void {
    const confirmacion = confirm(`⚠️ ¿Confirma la eliminación física de ${usuario.email}? Esta acción es irreversible.`);
    if (!confirmacion) return;

    this.eliminando[usuario.id_usuario] = true;

    this.usuarioService
      .eliminarUsuario(usuario.id_usuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const usuariosActualizados = this.usuarios().filter((u) => u.id_usuario !== usuario.id_usuario);
          this.usuarios.set(usuariosActualizados);
          this.eliminando[usuario.id_usuario] = false;
          alert('✅ Registro eliminado permanentemente.');
        },
        error: (err) => {
          this.eliminando[usuario.id_usuario] = false;
          alert('Error: La llave foránea o el servidor impidieron la eliminación.');
        },
      });
  }
}