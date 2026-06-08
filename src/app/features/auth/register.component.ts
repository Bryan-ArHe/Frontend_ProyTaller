import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioCreate } from '../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950 p-4 antialiased text-slate-200">
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        <!-- Identidad de la Plataforma -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-black text-white tracking-tight">🚗 EmergAuto</h1>
          <p class="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Registro de Nuevo Cliente</p>
        </div>

        <!-- Formulario Reactivo Estilizado -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <!-- Bloque en Paralelo: Nombre y Apellido -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre</label>
              <input
                type="text"
                formControlName="nombre"
                class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                placeholder="Juan"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apellido</label>
              <input
                type="text"
                formControlName="apellido"
                class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                placeholder="Pérez"
              />
            </div>
          </div>

          <!-- Correo Electrónico -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              formControlName="email"
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors font-mono"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <!-- Terminal Telefónica -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Número de Teléfono</label>
            <input
              type="text"
              formControlName="telefono"
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
              placeholder="7XXXXXXX"
            />
          </div>

          <!-- Contraseña de Acceso -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña</label>
            <input
              type="password"
              formControlName="password"
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <!-- Alertas del Servidor Backend -->
          <div class="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs font-medium" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>

          <!-- Botón de Envío Interactivo -->
          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
          >
            {{ loading ? 'Sincronizando...' : 'Crear Cuenta Operativa' }}
          </button>

          <!-- Retorno a Autenticación -->
          <p class="text-xs text-center text-slate-400 mt-4">
            ¿Ya eres miembro del ecosistema?
            <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  // 🛡️ CONFIGURACIÓN DE SEGURIDAD MÁXIMA: Forzamos el ID 5 (Cliente) por defecto
  readonly form = this.formBuilderGroup();

  private formBuilderGroup() {
    return this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.minLength(7)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      id_rol: [5, [Validators.required]], // 🌟 CORREGIDO: Mapeo nativo a Cliente para resguardar el RBAC
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload: UsuarioCreate = this.form.getRawValue();

    this.authService
      .register(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.detail ?? 'No se pudo procesar el alta de la cuenta.';
        },
      });
  }
}