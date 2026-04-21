import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioPerfil } from '../../core/models/usuario.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: `
    :host {
      display: block;
    }

    .card {
      background: white;
      border-radius: 1rem;
      border: 1px solid var(--color-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .input-field {
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s ease;
      background-color: white;
    }

    .input-field:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .input-field:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: white;
      color: #374151;
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 1rem;
      object-fit: cover;
      border: 3px solid var(--color-border);
    }

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      border: 3px solid var(--color-border);
    }
  `,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Encabezado -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-900">Mi Perfil</h1>
          <p class="text-gray-600 mt-2 text-lg">Administra tu información personal</p>
        </div>

        <!-- Estado de carga -->
        @if (cargando()) {
          <div class="flex justify-center py-16">
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p class="text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        }

        @if (!cargando()) {
          <!-- TARJETA: PERFIL -->
          <div class="card p-8 mb-8">
            <!-- Encabezado con foto y acciones -->
            <div
              class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-gray-200"
            >
              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <!-- Foto de usuario -->
                <div class="relative flex-shrink-0">
                  @if (fotoPerfil()) {
                    <img [src]="fotoPerfil()" alt="Foto de perfil" class="avatar" />
                  } @else {
                    <div class="avatar-placeholder">{{ iniciales() }}</div>
                  }
                  @if (editandoPerfil()) {
                    <button
                      type="button"
                      (click)="inputFoto.click()"
                      class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-md"
                      title="Cambiar foto"
                    >
                      📷
                    </button>
                    <input
                      #inputFoto
                      type="file"
                      accept="image/*"
                      (change)="cargarFoto($event)"
                      class="hidden"
                    />
                  }
                </div>

                <!-- Información básica -->
                <div class="text-center sm:text-left flex-1">
                  <h2 class="text-2xl font-bold text-gray-900">
                    {{ perfil()?.nombre }} {{ perfil()?.apellido }}
                  </h2>
                  <p class="text-gray-600 mt-1 break-all">{{ perfil()?.email }}</p>
                  <div class="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    @if (perfil()?.estado_cuenta === 'ACTIVO') {
                      <span
                        class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                      >
                        ✅ Activo
                      </span>
                    } @else if (perfil()?.estado_cuenta === 'INACTIVO') {
                      <span
                        class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
                      >
                        ⏸️ Inactivo
                      </span>
                    } @else {
                      <span
                        class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
                      >
                        ⏸️ Inactivo
                      </span>
                    }
                    <span
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                    >
                      👤 {{ perfil()?.rol?.nombre || 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="w-full sm:w-auto">
                @if (!editandoPerfil()) {
                  <button
                    type="button"
                    (click)="activarEditarPerfil()"
                    class="btn-primary w-full sm:w-auto"
                  >
                    ✏️ Editar
                  </button>
                }
              </div>
            </div>

            <!-- Formulario de edición o vista de lectura -->
            @if (editandoPerfil()) {
              <form [formGroup]="formPerfil" class="space-y-6">
                <!-- Información Personal -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Email -->
                    <div class="md:col-span-2">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input type="email" formControlName="email" class="input-field w-full" />
                      @if (formPerfil.get('email')?.invalid && formPerfil.get('email')?.touched) {
                        <p class="text-red-600 text-xs mt-1">Email inválido</p>
                      }
                    </div>

                    <!-- Nombre -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                      <input type="text" formControlName="nombre" class="input-field w-full" />
                    </div>

                    <!-- Apellido -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                      <input type="text" formControlName="apellido" class="input-field w-full" />
                    </div>

                    <!-- Teléfono -->
                    <div class="md:col-span-2">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                      <input type="tel" formControlName="telefono" class="input-field w-full" />
                    </div>
                  </div>
                </div>

                <!-- Sección de Contraseña -->
                <div class="pt-6 border-t border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">🔐 Cambiar Contraseña</h3>
                  <p class="text-sm text-gray-600 mb-4">
                    Deja estos campos vacíos si no deseas cambiar tu contraseña
                  </p>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Nueva Contraseña -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        formControlName="password"
                        placeholder="Mínimo 8 caracteres"
                        class="input-field w-full"
                      />
                      @if (
                        formPerfil.get('password')?.invalid && formPerfil.get('password')?.touched
                      ) {
                        <p class="text-red-600 text-xs mt-1">
                          Mínimo 8 caracteres si se desea cambiar
                        </p>
                      }
                    </div>

                    <!-- Confirmar Contraseña -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        formControlName="password_confirmacion"
                        placeholder="Repite la nueva contraseña"
                        class="input-field w-full"
                      />
                    </div>
                  </div>

                  <!-- Validación de contraseñas -->
                  @if (
                    formPerfil.errors?.['passwordMismatch'] && formPerfil.get('password')?.value
                  ) {
                    <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
                      <p class="text-yellow-700 text-sm">⚠️ Las contraseñas no coinciden</p>
                    </div>
                  }
                </div>

                <!-- Mensaje de error -->
                @if (errorPerfil()) {
                  <div class="bg-red-50 border border-red-300 rounded-lg p-4">
                    <p class="text-red-700 text-sm">❌ {{ errorPerfil() }}</p>
                  </div>
                }

                <!-- Botones de acción -->
                <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    (click)="cancelarEditarPerfil()"
                    class="btn-secondary flex-1 order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    (click)="guardarPerfil()"
                    [disabled]="!tieneChanges() || formPerfil.invalid || guardandoPerfil()"
                    class="btn-primary flex-1 order-1 sm:order-2"
                  >
                    @if (guardandoPerfil()) {
                      <span class="animate-spin inline-block mr-2">⚙️</span>
                      <span>Guardando...</span>
                    } @else {
                      ✅ Guardar Cambios
                    }
                  </button>
                </div>
              </form>
            } @else {
              <!-- Vista de lectura -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p class="text-sm text-gray-600 font-semibold">Email</p>
                      <p class="text-gray-900 mt-1 break-all">{{ perfil()?.email }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 font-semibold">Teléfono</p>
                      <p class="text-gray-900 mt-1">{{ perfil()?.telefono }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 font-semibold">Nombre</p>
                      <p class="text-gray-900 mt-1">{{ perfil()?.nombre || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 font-semibold">Apellido</p>
                      <p class="text-gray-900 mt-1">{{ perfil()?.apellido || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            }
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

  readonly inputFoto = viewChild<ElementRef>('inputFoto');

  // Signals
  perfil = signal<UsuarioPerfil | null>(null);
  fotoPerfil = signal<string | null>(null);
  cargando = signal(false);
  editandoPerfil = signal(false);
  guardandoPerfil = signal(false);
  errorPerfil = signal<string | null>(null);

  // Track de cambios: señal que se actualiza cuando el formulario cambia
  private formChanged = signal(false);

  // Formulario
  formPerfil = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      nombre: [''],
      apellido: [''],
      password: [''],
      password_confirmacion: [''],
    },
    { validators: this.passwordOptionalValidator },
  );

  // Computed para iniciales
  iniciales = computed(() => {
    const p = this.perfil();
    if (!p) return '?';
    const nombres = p.nombre?.charAt(0) || '';
    const apellidos = p.apellido?.charAt(0) || '';
    return (nombres + apellidos).toUpperCase() || '👤';
  });

  // Computed que detecta cambios en el formulario
  tieneChanges = computed(() => {
    // Leer la señal formChanged para crear dependencia
    this.formChanged();
    // También leer editandoPerfil para que se recompute cuando se entra en modo edición
    this.editandoPerfil();

    // Comparar valores originales con actuales
    const form = this.formPerfil.getRawValue();
    const originales = {
      email: this.perfil()?.email || '',
      telefono: this.perfil()?.telefono || '',
      nombre: this.perfil()?.nombre || '',
      apellido: this.perfil()?.apellido || '',
      password: '',
      password_confirmacion: '',
    };

    return JSON.stringify(form) !== JSON.stringify(originales);
  });

  constructor() {
    // Nada especial aquí
  }

  ngOnInit(): void {
    this.cargarPerfil();
    // Subscribirse a cambios del formulario
    this.formPerfil.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formChanged.set(!this.formChanged());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el perfil del usuario
   */
  private cargarPerfil(): void {
    this.cargando.set(true);
    this.usuarioService
      .getMiPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.formPerfil.patchValue({
            email: perfil.email,
            telefono: perfil.telefono,
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
          });
          this.cargando.set(false);
          // Reset formChanged después de cargar
          this.formChanged.set(false);
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.errorPerfil.set('Error cargando tu perfil');
          this.cargando.set(false);
        },
      });
  }

  /**
   * Activa el modo de edición
   */
  activarEditarPerfil(): void {
    this.editandoPerfil.set(true);
    this.errorPerfil.set(null);
  }

  /**
   * Cancela la edición
   */
  cancelarEditarPerfil(): void {
    this.editandoPerfil.set(false);
    this.fotoPerfil.set(null);
    this.formChanged.set(false);
    this.cargarPerfil();
  }

  /**
   * Carga foto del usuario
   */
  cargarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoPerfil.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Guarda los cambios del perfil
   */
  guardarPerfil(): void {
    if (this.formPerfil.invalid || !this.tieneChanges()) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    this.guardandoPerfil.set(true);
    this.errorPerfil.set(null);

    const data: any = this.formPerfil.getRawValue();

    // Si la contraseña está vacía, eliminarla del payload
    if (!data.password || data.password.trim() === '') {
      delete data.password;
      delete data.password_confirmacion;
    }

    console.log('Datos a enviar:', data);

    this.usuarioService
      .actualizarMiPerfil(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfilActualizado) => {
          console.log('Perfil respondido del backend:', perfilActualizado);
          console.log('Nombre:', perfilActualizado.nombre, 'Apellido:', perfilActualizado.apellido);

          // Cargar los datos completos del perfil (GET) para asegurar que tenemos nombre y apellido
          this.cargarPerfil();

          // Salir del modo edición y resetear estados
          this.editandoPerfil.set(false);
          this.guardandoPerfil.set(false);
          this.fotoPerfil.set(null);
          this.formChanged.set(false);

          alert('✅ Perfil actualizado exitosamente');
        },
        error: (err) => {
          console.error('Error completo:', err);

          // Extraer mensaje de error del backend
          let mensajeError = 'Error actualizando tu perfil';

          if (err.error) {
            if (typeof err.error === 'string') {
              mensajeError = err.error;
            } else if (err.error.detalle) {
              // Si detalle es un array, unir los mensajes
              if (Array.isArray(err.error.detalle)) {
                mensajeError = err.error.detalle.join(', ');
              } else {
                mensajeError = err.error.detalle;
              }
            } else if (err.error.mensaje) {
              mensajeError = err.error.mensaje;
            }
          }

          console.error('Mensaje de error:', mensajeError);
          this.errorPerfil.set(mensajeError);
          this.guardandoPerfil.set(false);
        },
      });
  }

  /**
   * Validador personalizado para contraseñas opcionales
   */
  private passwordOptionalValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmacion')?.value;

    if (!password && !confirmPassword) {
      return null;
    }

    if (password && password.trim() !== '') {
      if (password.length < 8) {
        return { passwordTooShort: true };
      }

      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
    }

    return null;
  }
}
