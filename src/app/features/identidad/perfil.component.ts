import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import {
  UsuarioPerfil,
  ActualizarPerfilData,
  CambiarPasswordData,
} from '../../core/models/usuario.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Encabezado -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p class="text-gray-600 mt-2">Administra tu información personal y seguridad</p>
        </div>

        <!-- Estado de carga general -->
        @if (cargando) {
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }

        @if (!cargando) {
          <!-- TARJETA 1: INFORMACIÓN PERSONAL -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Información Personal</h2>
                <p class="text-gray-600 text-sm mt-1">Actualiza tus datos personales</p>
              </div>
              @if (!editandoPerfil) {
                <button
                  (click)="activarEditarPerfil()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  ✏️ Editar
                </button>
              }
            </div>

            @if (editandoPerfil) {
              <form [formGroup]="formPerfil" (ngSubmit)="guardarPerfil()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      formControlName="email"
                      class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                    @if (formPerfil.get('email')?.invalid && formPerfil.get('email')?.touched) {
                      <p class="text-red-600 text-sm mt-1">Email inválido</p>
                    }
                  </div>

                  <!-- Teléfono -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      formControlName="telefono"
                      class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <!-- Nombres -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nombres</label>
                    <input
                      type="text"
                      formControlName="nombres"
                      class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <!-- Apellidos -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Apellidos</label>
                    <input
                      type="text"
                      formControlName="apellidos"
                      class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <!-- SECCIÓN: CAMBIAR CONTRASEÑA (OPCIONAL) -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <h3 class="text-sm font-semibold text-gray-900 mb-4">
                    🔐 Cambiar Contraseña (Opcional)
                  </h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Nueva Contraseña -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2"
                        >Nueva Contraseña</label
                      >
                      <input
                        type="password"
                        formControlName="password"
                        placeholder="Mínimo 8 caracteres"
                        class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                      <p class="text-sm text-gray-500 mt-1">
                        Si no desea modificar su contraseña, deje este espacio en blanco
                      </p>
                      @if (
                        formPerfil.get('password')?.invalid && formPerfil.get('password')?.touched
                      ) {
                        <p class="text-red-600 text-sm mt-1">
                          Mínimo 8 caracteres si se desea cambiar
                        </p>
                      }
                    </div>

                    <!-- Confirmar Contraseña -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2"
                        >Confirmar Contraseña</label
                      >
                      <input
                        type="password"
                        formControlName="password_confirmacion"
                        placeholder="Repite la nueva contraseña"
                        class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                      />
                      <p class="text-sm text-gray-500 mt-1">
                        Debe coincidir con la nueva contraseña
                      </p>
                    </div>
                  </div>

                  <!-- Validación de contraseñas coinciden -->
                  @if (
                    formPerfil.errors?.['passwordMismatch'] && formPerfil.get('password')?.value
                  ) {
                    <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
                      <p class="text-yellow-700">⚠️ Las contraseñas no coinciden</p>
                    </div>
                  }
                </div>

                <!-- Mensaje de error -->
                @if (errorPerfil) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-700">❌ {{ errorPerfil }}</p>
                  </div>
                }

                <!-- Botones de acción -->
                <div class="flex gap-4 pt-4">
                  <button
                    type="button"
                    (click)="cancelarEditarPerfil()"
                    class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="formPerfil.invalid || guardandoPerfil"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    @if (guardandoPerfil) {
                      <span class="animate-spin">⚙️</span>
                      <span>Guardando...</span>
                    } @else {
                      Guardar Cambios
                    }
                  </button>
                </div>
              </form>
            } @else {
              <!-- Vista de solo lectura -->
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <p class="text-lg font-semibold text-gray-900">{{ perfil?.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Teléfono</p>
                    <p class="text-lg font-semibold text-gray-900">{{ perfil?.telefono }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Nombres</p>
                    <p class="text-lg font-semibold text-gray-900">{{ perfil?.nombres || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Apellidos</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ perfil?.apellidos || '-' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Estado</p>
                    <div class="mt-1">
                      @if (perfil?.estado_cuenta === 'ACTIVO') {
                        <span
                          class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                        >
                          ✅ Activo
                        </span>
                      } @else if (perfil?.estado_cuenta === 'BLOQUEADO') {
                        <span
                          class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold"
                        >
                          🚫 Bloqueado
                        </span>
                      } @else {
                        <span
                          class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold"
                        >
                          ⏸️ Inactivo
                        </span>
                      }
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Rol</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ perfil?.rol?.nombre || 'N/A' }}
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- TARJETA 2: CAMBIAR CONTRASEÑA -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">Cambiar Contraseña</h2>
              <p class="text-gray-600 text-sm mt-1">
                Actualiza tu contraseña para mantener tu cuenta segura
              </p>
            </div>

            <form [formGroup]="formPassword" (ngSubmit)="cambiarPassword()" class="space-y-4">
              <!-- Contraseña actual -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Contraseña Actual</label
                >
                <input
                  type="password"
                  formControlName="password_actual"
                  placeholder="Ingresa tu contraseña actual"
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                />
                @if (
                  formPassword.get('password_actual')?.invalid &&
                  formPassword.get('password_actual')?.touched
                ) {
                  <p class="text-red-600 text-sm mt-1">Contraseña requerida</p>
                }
              </div>

              <!-- Nueva contraseña -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Nueva Contraseña</label
                >
                <input
                  type="password"
                  formControlName="password_nueva"
                  placeholder="Mínimo 8 caracteres"
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                />
                @if (
                  formPassword.get('password_nueva')?.invalid &&
                  formPassword.get('password_nueva')?.touched
                ) {
                  <p class="text-red-600 text-sm mt-1">Mínimo 8 caracteres</p>
                }
              </div>

              <!-- Confirmar contraseña -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Confirmar Contraseña</label
                >
                <input
                  type="password"
                  formControlName="password_confirmacion"
                  placeholder="Repite la nueva contraseña"
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 transition-colors"
                />
                @if (
                  formPassword.get('password_confirmacion')?.invalid &&
                  formPassword.get('password_confirmacion')?.touched
                ) {
                  <p class="text-red-600 text-sm mt-1">Confirmación requerida</p>
                }
              </div>

              <!-- Validación de contraseñas coinciden -->
              @if (
                formPassword.errors?.['passwordMismatch'] &&
                formPassword.get('password_confirmacion')?.touched
              ) {
                <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <p class="text-yellow-700">⚠️ Las contraseñas no coinciden</p>
                </div>
              }

              <!-- Mensaje de error -->
              @if (errorPassword) {
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-red-700">❌ {{ errorPassword }}</p>
                </div>
              }

              <!-- Mensaje de éxito -->
              @if (exitoPassword) {
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-green-700">✅ {{ exitoPassword }}</p>
                </div>
              }

              <!-- Botón de envío -->
              <button
                type="submit"
                [disabled]="formPassword.invalid || cambiadoPassword"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                @if (cambiadoPassword) {
                  <span class="animate-spin">⚙️</span>
                  <span>Cambiando contraseña...</span>
                } @else {
                  Cambiar Contraseña
                }
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
})
export class PerfilComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private destroy$ = new Subject<void>();

  // Estado
  cargando = false;
  editandoPerfil = false;
  guardandoPerfil = false;
  cambiadoPassword = false;

  // Datos
  perfil: UsuarioPerfil | null = null;

  // Errores y éxito
  errorPerfil: string | null = null;
  errorPassword: string | null = null;
  exitoPassword: string | null = null;

  // Formularios
  formPerfil = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      nombres: [''],
      apellidos: [''],
      password: [''],
      password_confirmacion: [''],
    },
    { validators: this.passwordOptionalValidator },
  );

  formPassword = this.fb.nonNullable.group(
    {
      password_actual: ['', Validators.required],
      password_nueva: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmacion: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit(): void {
    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el perfil del usuario
   */
  private cargarPerfil(): void {
    this.cargando = true;
    this.usuarioService
      .getMiPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfil) => {
          this.perfil = perfil;
          this.formPerfil.patchValue({
            email: perfil.email,
            telefono: perfil.telefono,
            nombres: perfil.nombres || '',
            apellidos: perfil.apellidos || '',
          });
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.cargando = false;
        },
      });
  }

  /**
   * Activa el modo de edición del perfil
   */
  activarEditarPerfil(): void {
    this.editandoPerfil = true;
    this.errorPerfil = null;
  }

  /**
   * Cancela la edición del perfil
   */
  cancelarEditarPerfil(): void {
    this.editandoPerfil = false;
    this.cargarPerfil();
  }

  /**
   * Guarda los cambios del perfil
   */
  guardarPerfil(): void {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    this.guardandoPerfil = true;
    this.errorPerfil = null;

    const data: any = this.formPerfil.getRawValue();

    // Si la contraseña está vacía, eliminarla del payload
    if (!data.password || data.password.trim() === '') {
      delete data.password;
      delete data.password_confirmacion;
    }

    this.usuarioService
      .actualizarMiPerfil(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfil) => {
          this.perfil = perfil;
          this.editandoPerfil = false;
          this.guardandoPerfil = false;
          this.formPerfil.reset();
          alert('✅ Perfil actualizado exitosamente');
          this.cargarPerfil();
        },
        error: (err) => {
          console.error('Error actualizando perfil:', err);
          this.errorPerfil = err.detalle || 'Error actualizando tu perfil';
          this.guardandoPerfil = false;
        },
      });
  }

  /**
   * Cambia la contraseña del usuario
   */
  cambiarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }

    this.cambiadoPassword = true;
    this.errorPassword = null;
    this.exitoPassword = null;

    const data: CambiarPasswordData = this.formPassword.getRawValue();

    this.usuarioService
      .cambiarPassword(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cambiadoPassword = false;
          this.exitoPassword = '✅ Contraseña cambiada exitosamente';
          this.formPassword.reset();
          setTimeout(() => (this.exitoPassword = null), 5000);
        },
        error: (err) => {
          console.error('Error cambiando contraseña:', err);
          this.errorPassword = err.detalle || 'Error cambiando tu contraseña';
          this.cambiadoPassword = false;
        },
      });
  }

  /**
   * Validador personalizado: verifica que las contraseñas coincidan (si se proporcionan)
   * Las contraseñas son opcionales en la edición de perfil
   */
  private passwordOptionalValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmacion')?.value;

    // Si ambos están vacíos, es válido
    if (!password && !confirmPassword) {
      return null;
    }

    // Si la contraseña tiene contenido, debe cumplir validaciones
    if (password && password.trim() !== '') {
      // Validar longitud mínima
      if (password.length < 8) {
        return { passwordTooShort: true };
      }

      // Validar coincidencia
      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
    }

    return null;
  }

  /**
   * Validador personalizado para el formulario de cambio de contraseña
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password_nueva')?.value;
    const confirmPassword = control.get('password_confirmacion')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
