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

    /* 🌟 Tarjeta adaptada a la estética pizarra oscura */
    .card {
      background: #0f172a; /* Slate 800 */
      border-radius: 1.25rem;
      border: 1px solid rgba(51, 65, 85, 0.5);
      box-shadow: 0 10px 25px -5px rgba(2, 6, 23, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card:hover {
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 20px 25px -5px rgba(2, 6, 23, 0.5);
    }

    /* 🌟 Inputs unificados con el Login y Registro */
    .input-field {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-family: inherit;
      transition: all 0.2s ease;
      background-color: #070a13;
      color: #f8fafc;
    }

    .input-field:focus {
      outline: none;
      border-color: #6366f1; /* Indigo 500 */
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .input-field:disabled {
      background-color: #0b0f19;
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* 🌟 Botonera corporativa pulida */
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
    }

    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: #1e293b;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #070a13;
      color: #cbd5e1;
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: #1e293b;
      color: white;
      border-color: #475569;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 1.25rem;
      object-fit: cover;
      border: 3px solid rgba(99, 102, 241, 0.2);
    }

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      border: 3px solid rgba(99, 102, 241, 0.2);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
  `,
  template: `
    <div class="p-2 sm:p-4 antialiased text-slate-200">
      <div class="max-w-2xl mx-auto">
        <!-- Encabezado Inmersivo -->
        <div class="mb-8">
          <h1 class="text-4xl font-extrabold text-white tracking-tight">Mi Perfil</h1>
          <p class="text-slate-400 mt-2 text-sm">Administra y resguarda tu información de acceso personal</p>
        </div>

        <!-- Estado de carga unificado -->
        @if (cargando()) {
          <div class="flex justify-center py-16">
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              <p class="text-slate-400 text-sm">Sincronizando perfil con el servidor...</p>
            </div>
          </div>
        }

        @if (!cargando()) {
          <!-- TARJETA PRINCIPAL -->
          <div class="card p-6 sm:p-8 mb-8">
            <!-- Encabezado con foto y acciones -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-8 pb-8 border-b border-slate-800/80">
              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                
                <!-- Foto de usuario con control de cambios -->
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
                      class="absolute bottom-[-4px] right-[-4px] bg-indigo-600 text-white rounded-xl p-2 hover:bg-indigo-500 transition-colors shadow-lg"
                      title="Cambiar foto de perfil"
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

                <!-- Información básica de la cuenta -->
                <div class="text-center sm:text-left flex-1">
                  <h2 class="text-2xl font-bold text-white tracking-tight">
                    {{ perfil()?.nombre }} {{ perfil()?.apellido }}
                  </h2>
                  <p class="text-slate-400 mt-1 font-mono text-sm break-all">{{ perfil()?.email }}</p>
                  
                  <div class="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span
                      *ngIf="perfil()?.estado_cuenta === 'ACTIVO'"
                      class="px-2.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      🟢 Activo
                    </span>
                    <span
                      *ngIf="perfil()?.estado_cuenta !== 'ACTIVO'"
                      class="px-2.5 py-0.5 bg-rose-950/40 text-rose-400 border border-rose-800/40 rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      ⏸️ Inactivo
                    </span>
                    
                    <span class="px-2.5 py-0.5 bg-slate-900 text-sky-400 border border-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                      👤 {{ perfil()?.rol?.nombre || 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Botonera de entrada a edición -->
              <div class="w-full sm:w-auto">
                @if (!editandoPerfil()) {
                  <button
                    type="button"
                    (click)="activarEditarPerfil()"
                    class="btn-primary w-full sm:w-auto text-xs uppercase tracking-wider font-bold"
                  >
                    ✏️ Editar Perfil
                  </button>
                }
              </div>
            </div>

            <!-- Formulario Reactivo de edición -->
            @if (editandoPerfil()) {
              <form [formGroup]="formPerfil" class="space-y-6">
                <div>
                  <h3 class="text-md font-bold text-white uppercase tracking-wider text-xs mb-4 text-indigo-400">Información Personal</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <!-- Campo Email (Solo lectura por consistencia Multi-tenant) -->
                    <div class="md:col-span-2 flex flex-col">
                      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Corporativo</label>
                      <input type="email" formControlName="email" class="input-field w-full font-mono text-slate-400" readonly />
                    </div>

                    <!-- Campo Nombre -->
                    <div class="flex flex-col">
                      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre</label>
                      <input type="text" formControlName="nombre" class="input-field w-full" placeholder="Ingresa tu nombre" />
                    </div>

                    <!-- Campo Apellido -->
                    <div class="flex flex-col">
                      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apellido</label>
                      <input type="text" formControlName="apellido" class="input-field w-full" placeholder="Ingresa tu apellido" />
                    </div>

                    <!-- Campo Teléfono -->
                    <div class="md:col-span-2 flex flex-col">
                      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Número Telefónico</label>
                      <input type="tel" formControlName="telefono" class="input-field w-full" placeholder="Ej. 7XXXXXXX" />
                    </div>
                  </div>
                </div>

                <!-- Resguardo de Seguridad: Contraseña Opcional -->
                <div class="pt-6 border-t border-slate-800/80">
                  <h3 class="text-md font-bold text-white uppercase tracking-wider text-xs mb-1 text-indigo-400">🔐 Cambiar Contraseña</h3>
                  <p class="text-xs text-slate-500 mb-4">Dejar estos encasillados completamente vacíos si no deseas alterar tu clave actual</p>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col">
                      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nueva Contraseña</label>
                      <input
                        type="password"
                        formControlName="password"
                        placeholder="Mínimo 8 caracteres"
                        class="input-field w-full"
                      />
                      @if (formPerfil.get('password')?.invalid && formPerfil.get('password')?.touched) {
                        <p class="text-rose-400 text-xs mt-1.5">Mínimo 8 caracteres requeridos</p>
                      }
                    </div>

                    <div class="flex flex-col">
                      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirmar Contraseña</label>
                      <input
                        type="password"
                        formControlName="password_confirmacion"
                        placeholder="Repite la contraseña"
                        class="input-field w-full"
                      />
                    </div>
                  </div>

                  <!-- Alerta de coincidencia errónea -->
                  @if (formPerfil.errors?.['passwordMismatch'] && formPerfil.get('password')?.value) {
                    <div class="bg-rose-950/30 border border-rose-900/40 rounded-xl p-4 mt-4">
                      <p class="text-rose-400 text-xs font-medium">⚠️ Los campos de contraseña digitalizados no coinciden.</p>
                    </div>
                  }
                </div>

                <!-- Excepciones del Servidor -->
                @if (errorPerfil()) {
                  <div class="bg-rose-950/30 border border-rose-900/40 rounded-xl p-4">
                    <p class="text-rose-400 text-xs font-medium">❌ {{ errorPerfil() }}</p>
                  </div>
                }

                <!-- Botonera de confirmación de cambios -->
                <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-800/80">
                  <button
                    type="button"
                    (click)="cancelarEditarPerfil()"
                    class="btn-secondary flex-1 order-2 sm:order-1 text-xs uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    (click)="guardarPerfil()"
                    [disabled]="!tieneChanges() || formPerfil.invalid || guardandoPerfil()"
                    class="btn-primary flex-1 order-1 sm:order-2 text-xs uppercase tracking-wider font-bold"
                  >
                    @if (guardandoPerfil()) {
                      <span class="animate-spin inline-block mr-2">⚙️</span>
                      <span>Guardando Cambios...</span>
                    } @else {
                      ✅ Confirmar Cambios
                    }
                  </button>
                </div>
              </form>
            } @else {
              <!-- Vista de lectura pasiva -->
              <div class="space-y-6 animate-in fade-in duration-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Email Corporativo</p>
                    <p class="text-slate-200 mt-1.5 font-mono text-sm break-all">{{ perfil()?.email }}</p>
                  </div>
                  <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Número de Teléfono</p>
                    <p class="text-slate-200 mt-1.5 text-sm">{{ perfil()?.telefono }}</p>
                  </div>
                  <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Nombre</p>
                    <p class="text-slate-200 mt-1.5 text-sm">{{ perfil()?.nombre || '-' }}</p>
                  </div>
                  <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Apellido</p>
                    <p class="text-slate-200 mt-1.5 text-sm">{{ perfil()?.apellido || '-' }}</p>
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

  private formChanged = signal(false);

  // Formulario Reactivo
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

  // Iniciales dinámicas para el avatar
  iniciales = computed(() => {
    const p = this.perfil();
    if (!p) return '?';
    const nombres = p.nombre?.charAt(0) || '';
    const apellidos = p.apellido?.charAt(0) || '';
    return (nombres + apellidos).toUpperCase() || '👤';
  });

  // Verificador de mutaciones en los campos
  tieneChanges = computed(() => {
    this.formChanged();
    this.editandoPerfil();

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

  ngOnInit(): void {
    this.cargarPerfil();
    this.formPerfil.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formChanged.set(!this.formChanged());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
          this.formChanged.set(false);
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.errorPerfil.set('Ocurrió un error al sincronizar el perfil con el servidor.');
          this.cargando.set(false);
        },
      });
  }

  activarEditarPerfil(): void {
    this.editandoPerfil.set(true);
    this.errorPerfil.set(null);
  }

  cancelarEditarPerfil(): void {
    this.editandoPerfil.set(false);
    this.fotoPerfil.set(null);
    this.formChanged.set(false);
    this.cargarPerfil();
  }

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

  guardarPerfil(): void {
    if (this.formPerfil.invalid || !this.tieneChanges()) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    this.guardandoPerfil.set(true);
    this.errorPerfil.set(null);

    const data: any = this.formPerfil.getRawValue();

    if (!data.password || data.password.trim() === '') {
      delete data.password;
      delete data.password_confirmacion;
    }

    this.usuarioService
      .actualizarMiPerfil(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfilActualizado) => {
          // 🌟 MEJORA UX ESTRATÉGICA: Estampamos de inmediato el nombre en el LocalStorage.
          // Al actualizarse aquí, el HeaderComponent modificará el saludo instantáneamente.
          const nombreCompleto = `${data.nombre || ''}`.trim() || perfilActualizado.nombre;
          if (nombreCompleto) {
            localStorage.setItem('usuario_nombre', nombreCompleto);
          }

          this.cargarPerfil();
          this.editandoPerfil.set(false);
          this.guardandoPerfil.set(false);
          this.fotoPerfil.set(null);
          this.formChanged.set(false);

          alert('✅ Perfil actualizado exitosamente');
        },
        error: (err) => {
          console.error('Error completo:', err);
          let mensajeError = 'Error actualizando tu perfil';

          if (err.error) {
            if (typeof err.error === 'string') {
              mensajeError = err.error;
            } else if (err.error.detalle) {
              mensajeError = Array.isArray(err.error.detalle) 
                ? err.error.detalle.join(', ') 
                : err.error.detalle;
            } else if (err.error.mensaje) {
              mensajeError = err.error.mensaje;
            }
          }
          this.errorPerfil.set(mensajeError);
          this.guardandoPerfil.set(false);
        },
      });
  }

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