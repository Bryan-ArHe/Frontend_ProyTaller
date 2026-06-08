import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolService } from '../../core/services/rol.service';
import { Rol, Permiso } from '../../core/models/auth.model';
import { Subject, takeUntil } from 'rxjs';

interface PermisoConEstado extends Permiso {
  asignado: boolean;
}

/**
 * Componente para gestionar Roles y sus Permisos
 * Solo accesible para administradores corporativos (RBAC)
 */
@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-2 sm:p-4 antialiased text-slate-200">
      <div class="max-w-7xl mx-auto">
        <!-- 🔐 ENCABEZADO DEL PANEL -->
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Gestión de Roles y Permisos</h1>
          <p class="text-slate-400 mt-1 text-sm">Configura las directivas de seguridad perimetral para cada rol del ecosistema</p>
        </div>

        <!-- 🔄 ESTADO DE CARGA INICIAL -->
        @if (cargandoInicial()) {
          <div class="flex justify-center py-16">
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              <p class="text-slate-400 text-sm">Cargando matriz de seguridad corporativa...</p>
            </div>
          </div>
        }

        @if (!cargandoInicial()) {
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- PANEL IZQUIERDO: LISTA DE ROLES (Estilo Acordeón/Botón Slate) -->
            <div class="lg:col-span-1">
              <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sticky top-6 backdrop-blur-sm shadow-xl">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>📋</span> Roles del Ecosistema
                </h2>

                <!-- Control de excepciones al cargar roles -->
                @if (errorRoles()) {
                  <div class="bg-rose-950/30 border border-rose-900/40 rounded-xl p-4 mb-4">
                    <p class="text-rose-400 text-xs font-medium">❌ {{ errorRoles() }}</p>
                  </div>
                }

                <!-- Lista de roles interactiva -->
                <div class="space-y-2.5">
                  @for (rol of roles(); track rol.id_rol) {
                    <button
                      (click)="seleccionarRol(rol)"
                      [class.bg-indigo-950\/40]="rolSeleccionado()?.id_rol === rol.id_rol"
                      [class.border-indigo-500]="rolSeleccionado()?.id_rol === rol.id_rol"
                      [class.shadow-indigo-500\/5]="rolSeleccionado()?.id_rol === rol.id_rol"
                      class="w-full text-left px-4 py-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/80 bg-slate-950/40 hover:bg-slate-900/40 transition-all duration-200 group"
                    >
                      <p class="font-bold text-sm text-slate-200 group-hover:text-white transition-colors"
                         [class.text-indigo-400]="rolSeleccionado()?.id_rol === rol.id_rol">
                        {{ rol.nombre }}
                      </p>
                      <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">{{ rol.descripcion }}</p>
                    </button>
                  }
                </div>

                @if (roles().length === 0) {
                  <div class="text-center py-8 text-slate-500 text-sm">
                    No hay roles mapeados en el sistema.
                  </div>
                }
              </div>
            </div>

            <!-- PANEL DERECHO: MATRIZ DE ASIGNACIÓN DE PERMISOS -->
            <div class="lg:col-span-3">
              @if (rolSeleccionado()) {
                <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
                  <!-- Encabezado del rol activo -->
                  <div class="mb-6 pb-6 border-b border-slate-800/80">
                    <div class="flex items-center gap-3">
                      <h2 class="text-2xl font-black text-white tracking-tight">
                        {{ rolSeleccionado()?.nombre }}
                      </h2>
                      <span class="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        ID: {{ rolSeleccionado()?.id_rol }}
                      </span>
                    </div>
                    <p class="text-slate-400 text-sm mt-2 leading-relaxed">{{ rolSeleccionado()?.descripcion }}</p>
                  </div>

                  <!-- Estado de carga interno para permisos -->
                  @if (cargandoPermisos()) {
                    <div class="flex justify-center py-16">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                  }

                  @if (!cargandoPermisos()) {
                    <!-- Error interno al cargar permisos -->
                    @if (errorPermisos()) {
                      <div class="bg-rose-950/30 border border-rose-900/40 rounded-xl p-4 mb-6">
                        <p class="text-rose-400 text-sm font-medium">❌ {{ errorPermisos() }}</p>
                        <button
                          (click)="recargarPermisos()"
                          class="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider underline"
                        >
                          Forzar Sincronización
                        </button>
                      </div>
                    }

                    <!-- Grid de Permisos Modulares -->
                    <div class="mb-8">
                      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <span>🔒</span> Directivas de Operación Disponibles
                      </h3>

                      @if (permisosConEstado().length > 0) {
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          @for (permiso of permisosConEstado(); track permiso.id_permiso) {
                            <div
                              (click)="togglePermiso(permiso.id_permiso)"
                              class="flex items-start p-4 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer bg-slate-950/20 select-none group"
                              [class.bg-indigo-950\/10]="permiso.asignado"
                              [class.border-indigo-500\/30]="permiso.asignado"
                            >
                              <!-- Checkbox Estilizado Dark -->
                              <div class="flex items-center h-5 mr-4 flex-shrink-0" (click)="$event.stopPropagation()">
                                <input
                                  type="checkbox"
                                  [id]="'permiso_' + permiso.id_permiso"
                                  [checked]="permiso.asignado"
                                  (change)="togglePermiso(permiso.id_permiso)"
                                  [disabled]="guardandoPermisos()"
                                  class="w-4 h-4 bg-slate-950 border-slate-800 text-indigo-600 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                              </div>

                              <!-- Textos descriptivos -->
                              <div class="flex-1">
                                <p class="font-bold text-sm text-slate-200 group-hover:text-white transition-colors"
                                   [class.text-indigo-400]="permiso.asignado">
                                  {{ permiso.nombre }}
                                </p>
                                <p class="text-xs text-slate-400 mt-1 leading-relaxed">{{ permiso.descripcion }}</p>
                              </div>

                              <!-- Indicador visual de cambio en memoria (Save Badge) -->
                              @if (permisoCambio(permiso.id_permiso)) {
                                <div class="ml-2 flex-shrink-0 animate-in fade-in zoom-in-95 duration-150">
                                  <span class="inline-flex items-center justify-center w-6 h-6 bg-amber-950/40 border border-amber-800/40 rounded-lg text-xs"
                                        title="Cambio pendiente de guardar">
                                    💾
                                  </span>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="text-center py-12 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-sm">
                          No hay directivas de permisos mapeadas en el núcleo del sistema.
                        </div>
                      }
                    </div>

                    <!-- Botonera de persistencia -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-800/80">
                      <button
                        (click)="restablecerPermisos()"
                        [disabled]="!tienePermisosModificados() || guardandoPermisos()"
                        class="flex-1 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ↩️ Revertir Cambios
                      </button>
                      <button
                        (click)="guardarPermisos()"
                        [disabled]="!tienePermisosModificados() || guardandoPermisos()"
                        class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        @if (guardandoPermisos()) {
                          <span class="animate-spin inline-block mr-1.5">⚙️</span>
                          <span>Guardando Cambios...</span>
                        } @else {
                          ✅ Confirmar Cambios
                        }
                      </button>
                    </div>

                    <!-- Banner de Confirmación Exitosas -->
                    @if (exitoGuardado()) {
                      <div class="mt-4 bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p class="text-emerald-400 text-xs font-medium">{{ exitoGuardado() }}</p>
                      </div>
                    }
                  }
                </div>
              } @else {
                <!-- Estado pasivo sin rol seleccionado (Móviles/Cargas atenuadas) -->
                <div class="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center">
                  <div class="text-5xl mb-4 filter drop-shadow-md">👈</div>
                  <h3 class="text-lg font-bold text-white mb-1">Selecciona un Rol</h3>
                  <p class="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Elige un perfil institucional de la columna de control para auditar y mapear sus permisos operativos en el Tenant.
                  </p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class GestionRolesComponent implements OnInit, OnDestroy {
  private readonly rolService = inject(RolService);
  private destroy$ = new Subject<void>();

  roles = signal<Rol[]>([]);
  rolSeleccionado = signal<Rol | null>(null);
  permisosConEstado = signal<PermisoConEstado[]>([]);
  permisosOriginales = signal<number[]>([]);

  cargandoInicial = signal(false);
  cargandoPermisos = signal(false);
  guardandoPermisos = signal(false);
  errorRoles = signal<string | null>(null);
  errorPermisos = signal<string | null>(null);
  exitoGuardado = signal<string | null>(null);

  private permisosModificados = new Set<number>();

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarRoles(): void {
    this.cargandoInicial.set(true);
    this.errorRoles.set(null);

    this.rolService
      .getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles.set(roles);
          this.cargandoInicial.set(false);

          if (roles.length > 0) {
            this.seleccionarRol(roles[0]);
          }
        },
        error: (err) => {
          console.error('Error cargando roles:', err);
          this.errorRoles.set(err.detalle || 'Error al conectar con la pasarela de seguridad.');
          this.cargandoInicial.set(false);
        },
      });
  }

  seleccionarRol(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.exitoGuardado.set(null);
    this.permisosModificados.clear();
    this.recargarPermisos();
  }

  recargarPermisos(): void {
    const rolSeleccionado = this.rolSeleccionado();
    if (!rolSeleccionado) return;

    this.cargandoPermisos.set(true);
    this.errorPermisos.set(null);

    this.rolService
      .getPermisos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permisosGlobales) => {
          const idsPermisosRol = (rolSeleccionado.permisos || []).map((p) => p.id_permiso);
          this.permisosOriginales.set([...idsPermisosRol]);

          const mapeados = permisosGlobales.map((p) => ({
            ...p,
            asignado: idsPermisosRol.includes(p.id_permiso),
          }));

          this.permisosConEstado.set(mapeados);
          this.cargandoPermisos.set(false);
          this.permisosModificados.clear();
        },
        error: (err) => {
          console.error('Error cargando permisos globales:', err);
          this.errorPermisos.set(err.detalle || 'No se pudo sincronizar la matriz de permisos globales.');
          this.cargandoPermisos.set(false);
        },
      });
  }

  /**
   * Toggle optimizado inyectando el cambio de manera atómica e inmutable en el Signal
   */
  togglePermiso(idPermiso: number): void {
    if (this.guardandoPermisos()) return;

    // 🚀 MEJORA REACTIVA: Mapeamos de forma inmutable garantizando el ciclo de vida del Signal
    const actualizados = this.permisosConEstado().map((p) => {
      if (p.id_permiso === idPermiso) {
        return { ...p, asignado: !p.asignado };
      }
      return p;
    });

    this.permisosConEstado.set(actualizados);

    // Evaluamos si el estado mutado difiere del original para activar o limpiar el badge de guardado (Set)
    const esOriginal = this.permisosOriginales().includes(idPermiso);
    const estadoActual = actualizados.find((p) => p.id_permiso === idPermiso)?.asignado;

    if (estadoActual === esOriginal) {
      this.permisosModificados.delete(idPermiso);
    } else {
      this.permisosModificados.add(idPermiso);
    }
  }

  tienePermisosModificados(): boolean {
    return this.permisosModificados.size > 0;
  }

  permisoCambio(idPermiso: number): boolean {
    return this.permisosModificados.has(idPermiso);
  }

  restablecerPermisos(): void {
    const idsOriginales = this.permisosOriginales();
    const restaurados = this.permisosConEstado().map((p) => ({
      ...p,
      asignado: idsOriginales.includes(p.id_permiso),
    }));

    this.permisosConEstado.set(restaurados);
    this.permisosModificados.clear();
  }

  guardarPermisos(): void {
    const rolId = this.rolSeleccionado()?.id_rol;
    if (!rolId) return;

    this.guardandoPermisos.set(true);
    this.exitoGuardado.set(null);

    const permisosSeleccionados = this.permisosConEstado()
      .filter((p) => p.asignado)
      .map((p) => p.id_permiso);

    this.rolService
      .actualizarPermisosDeRol(rolId, { permisos_ids: permisosSeleccionados })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rolActualizado) => {
          this.guardandoPermisos.set(false);
          this.exitoGuardado.set(
            `✅ Políticas de acceso para el rol "${rolActualizado.nombre}" reconfiguradas exitosamente.`
          );
          this.permisosModificados.clear();
          this.permisosOriginales.set([...permisosSeleccionados]);

          // Actualizamos la referencia en memoria del rol seleccionado para reflejar sus nuevos permisos
          if (this.rolSeleccionado()?.id_rol === rolActualizado.id_rol) {
            this.rolSeleccionado.set(rolActualizado);
          }

          setTimeout(() => this.exitoGuardado.set(null), 5000);
        },
        error: (err) => {
          console.error('Error guardando permisos:', err);
          this.guardandoPermisos.set(false);
          alert(`❌ Error: El perímetro de seguridad rechazó los cambios de infraestructura.`);
        },
      });
  }
}