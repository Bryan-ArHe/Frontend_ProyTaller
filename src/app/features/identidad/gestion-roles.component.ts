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
 * Solo accesible para administradores
 */
@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Encabezado -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Roles y Permisos</h1>
          <p class="text-gray-600 mt-2">Configura los permisos para cada rol del sistema</p>
        </div>

        <!-- Estado de carga inicial -->
        @if (cargandoInicial()) {
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }

        @if (!cargandoInicial()) {
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- PANEL IZQUIERDO: LISTA DE ROLES -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 class="text-lg font-bold text-gray-900 mb-4">📋 Roles Disponibles</h2>

                <!-- Error al cargar roles -->
                @if (errorRoles()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p class="text-red-700 text-sm">❌ {{ errorRoles() }}</p>
                  </div>
                }

                <!-- Lista de roles -->
                <div class="space-y-2">
                  @for (rol of roles(); track rol.id_rol) {
                    <button
                      (click)="seleccionarRol(rol)"
                      [class.bg-blue-100]="rolSeleccionado()?.id_rol === rol.id_rol"
                      [class.border-blue-500]="rolSeleccionado()?.id_rol === rol.id_rol"
                      class="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    >
                      <p class="font-semibold text-gray-900">{{ rol.nombre }}</p>
                      <p class="text-xs text-gray-600 mt-1">{{ rol.descripcion }}</p>
                    </button>
                  }
                </div>

                @if (roles().length === 0) {
                  <div class="text-center py-8">
                    <p class="text-gray-500">No hay roles disponibles</p>
                  </div>
                }
              </div>
            </div>

            <!-- PANEL DERECHO: GESTIÓN DE PERMISOS -->
            <div class="lg:col-span-3">
              @if (rolSeleccionado()) {
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <!-- Encabezado del rol -->
                  <div class="mb-8 pb-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-900">
                      {{ rolSeleccionado()?.nombre }}
                    </h2>
                    <p class="text-gray-600 mt-2">{{ rolSeleccionado()?.descripcion }}</p>
                  </div>

                  <!-- Estado de carga de permisos -->
                  @if (cargandoPermisos()) {
                    <div class="flex justify-center py-12">
                      <div
                        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                      ></div>
                    </div>
                  }

                  @if (!cargandoPermisos()) {
                    <!-- Error al cargar permisos -->
                    @if (errorPermisos()) {
                      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p class="text-red-700">❌ {{ errorPermisos() }}</p>
                        <button
                          (click)="recargarPermisos()"
                          class="mt-2 text-red-600 hover:text-red-700 underline text-sm"
                        >
                          Reintentar
                        </button>
                      </div>
                    }

                    <!-- Grid de Permisos -->
                    <div class="mb-8">
                      <h3 class="text-lg font-semibold text-gray-900 mb-4">
                        🔒 Permisos del Sistema
                      </h3>

                      @if (permisosConEstado().length > 0) {
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          @for (permiso of permisosConEstado(); track permiso.id_permiso) {
                            <div
                              class="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                              [class.bg-blue-50]="permiso.asignado"
                            >
                              <!-- Checkbox -->
                              <div class="flex items-center h-6 mr-4 flex-shrink-0">
                                <input
                                  type="checkbox"
                                  [id]="'permiso_' + permiso.id_permiso"
                                  [checked]="permiso.asignado"
                                  (change)="togglePermiso(permiso.id_permiso)"
                                  [disabled]="guardandoPermisos()"
                                  class="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer disabled:opacity-50"
                                />
                              </div>

                              <!-- Label -->
                              <label
                                [for]="'permiso_' + permiso.id_permiso"
                                class="flex-1 cursor-pointer select-none"
                              >
                                <p class="font-semibold text-gray-900">{{ permiso.nombre }}</p>
                                <p class="text-sm text-gray-600 mt-1">{{ permiso.descripcion }}</p>
                              </label>

                              <!-- Indicador de cambio -->
                              @if (permisoCambio(permiso.id_permiso)) {
                                <div class="ml-2 flex-shrink-0">
                                  <span
                                    class="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full"
                                  >
                                    <span class="text-xs text-yellow-700">💾</span>
                                  </span>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="text-center py-12 bg-gray-50 rounded-lg">
                          <p class="text-gray-500">No hay permisos disponibles</p>
                        </div>
                      }
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        (click)="restablecerPermisos()"
                        [disabled]="!tienePermisosModificados() || guardandoPermisos()"
                        class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
                      >
                        ↩️ Revertir Cambios
                      </button>
                      <button
                        (click)="guardarPermisos()"
                        [disabled]="!tienePermisosModificados() || guardandoPermisos()"
                        class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                      >
                        @if (guardandoPermisos()) {
                          <span class="animate-spin">⚙️</span>
                          <span>Guardando...</span>
                        } @else {
                          ✅ Guardar Cambios
                        }
                      </button>
                    </div>

                    <!-- Mensaje de éxito -->
                    @if (exitoGuardado()) {
                      <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p class="text-green-700">✅ {{ exitoGuardado() }}</p>
                      </div>
                    }
                  }
                </div>
              } @else {
                <!-- Sin rol seleccionado -->
                <div class="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div class="text-6xl mb-4">👈</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Selecciona un rol</h3>
                  <p class="text-gray-600">
                    Elige un rol de la lista de la izquierda para ver y gestionar sus permisos
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

  // Signals para reactividad
  roles = signal<Rol[]>([]);
  rolSeleccionado = signal<Rol | null>(null);
  permisosConEstado = signal<PermisoConEstado[]>([]);
  permisosOriginales = signal<number[]>([]);

  // Estado de carga y errores
  cargandoInicial = signal(false);
  cargandoPermisos = signal(false);
  guardandoPermisos = signal(false);
  errorRoles = signal<string | null>(null);
  errorPermisos = signal<string | null>(null);
  exitoGuardado = signal<string | null>(null);

  // Track de cambios
  private permisosModificados = new Set<number>();

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los roles disponibles
   */
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

          // Seleccionar el primer rol automáticamente
          if (roles.length > 0) {
            this.seleccionarRol(roles[0]);
          }
        },
        error: (err) => {
          console.error('Error cargando roles:', err);
          this.errorRoles.set(err.detalle || 'Error cargando roles');
          this.cargandoInicial.set(false);
        },
      });
  }

  /**
   * Selecciona un rol y carga sus permisos
   */
  seleccionarRol(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.exitoGuardado.set(null);
    this.permisosModificados.clear();
    this.recargarPermisos();
  }

  /**
   * Recarga los permisos del rol seleccionado
   */
  recargarPermisos(): void {
    const rolSeleccionado = this.rolSeleccionado();
    if (!rolSeleccionado) return;

    this.cargandoPermisos.set(true);
    this.errorPermisos.set(null);

    // Obtener todos los permisos del sistema
    this.rolService
      .getPermisos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permisosGlobales) => {
          // Los permisos del rol ya vienen en rolSeleccionado.permisos
          const idsPermisosRol = (rolSeleccionado.permisos || []).map((p) => p.id_permiso);
          this.permisosOriginales.set([...idsPermisosRol]);

          // Construir array de permisos con estado
          const permisosConEstado = permisosGlobales.map((p) => ({
            ...p,
            asignado: idsPermisosRol.includes(p.id_permiso),
          }));

          this.permisosConEstado.set(permisosConEstado);
          this.cargandoPermisos.set(false);
          this.permisosModificados.clear();
        },
        error: (err) => {
          console.error('Error cargando permisos globales:', err);
          this.errorPermisos.set(err.detalle || 'Error cargando permisos');
          this.cargandoPermisos.set(false);
        },
      });
  }

  /**
   * Toggle para activar/desactivar un permiso
   */
  togglePermiso(idPermiso: number): void {
    const permisos = this.permisosConEstado();
    const permiso = permisos.find((p) => p.id_permiso === idPermiso);

    if (permiso) {
      permiso.asignado = !permiso.asignado;
      this.permisosConEstado.set([...permisos]);

      // Marcar como modificado
      this.permisosModificados.add(idPermiso);
    }
  }

  /**
   * Verifica si hay permisos modificados
   */
  tienePermisosModificados(): boolean {
    return this.permisosModificados.size > 0;
  }

  /**
   * Verifica si un permiso fue modificado
   */
  permisoCambio(idPermiso: number): boolean {
    return this.permisosModificados.has(idPermiso);
  }

  /**
   * Revierte los cambios a los permisos
   */
  restablecerPermisos(): void {
    const idsOriginales = this.permisosOriginales();
    const permisos = this.permisosConEstado().map((p) => ({
      ...p,
      asignado: idsOriginales.includes(p.id_permiso),
    }));

    this.permisosConEstado.set(permisos);
    this.permisosModificados.clear();
  }

  /**
   * Guarda los cambios de permisos
   */
  guardarPermisos(): void {
    const rolId = this.rolSeleccionado()?.id_rol;
    if (!rolId) return;

    this.guardandoPermisos.set(true);
    this.exitoGuardado.set(null);

    // Obtener IDs de permisos seleccionados
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
            `✅ Permisos del rol "${rolActualizado.nombre}" actualizados exitosamente`,
          );
          this.permisosModificados.clear();
          this.permisosOriginales.set([...permisosSeleccionados]);

          setTimeout(() => this.exitoGuardado.set(null), 5000);
        },
        error: (err) => {
          console.error('Error guardando permisos:', err);
          this.guardandoPermisos.set(false);
          alert(`❌ Error: ${err.detalle || 'No se pudieron guardar los permisos'}`);
        },
      });
  }
}
