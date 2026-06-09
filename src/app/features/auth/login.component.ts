import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { LoginData } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-slate-950 p-4 antialiased text-slate-200"
    >
      <div
        class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
      >
        <!-- Identidad Corporativa del Sistema -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-white tracking-tight">🚗 EmergAuto</h1>
          <p class="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
            Plataforma de Control Multi-Tenant
          </p>
        </div>

        <!-- Formulario Reactivo -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Correo Electrónico -->
          <div>
            <label
              class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              >Correo Electrónico</label
            >
            <input
              type="email"
              formControlName="email"
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors font-mono"
              placeholder="operador@emergauto.com"
            />
            <p
              class="text-rose-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-in fade-in duration-150"
              *ngIf="form.controls.email.touched && form.controls.email.invalid"
            >
              <span>⚠️</span> Ingresa un email corporativo válido.
            </p>
          </div>

          <!-- Contraseña de Acceso -->
          <div>
            <label
              class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              >Contraseña</label
            >
            <input
              type="password"
              formControlName="password"
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <p
              class="text-rose-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-in fade-in duration-150"
              *ngIf="form.controls.password.touched && form.controls.password.invalid"
            >
              <span>⚠️</span> La contraseña de acceso es obligatoria.
            </p>
          </div>

          <!-- Manejo de Excepciones del Servidor (Errores 401/403/500) -->
          <div
            class="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs font-medium"
            *ngIf="errorMessage"
          >
            💥 {{ errorMessage }}
          </div>

          <!-- Botón de Acción Interactivo -->
          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
          >
            {{ loading ? 'Autenticando...' : 'Iniciar Sesión' }}
          </button>

          <!-- Enlace de Navegación Pública -->
          <p class="text-xs text-center text-slate-400 mt-5">
            ¿Aún no posees una cuenta de usuario?
            <a
              routerLink="/register"
              class="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors"
              >Regístrate aquí</a
            >
          </p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {

      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // 🌟 TRUCO MAESTRO: Destruimos cualquier sesión residual del usuario anterior antes de loguear al nuevo
    localStorage.clear();
    sessionStorage.clear();

    const payload: LoginData = this.form.getRawValue();

    this.authService
      .login(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          // Forzamos un micro-retraso para asegurar que los tokens se asienten en el disco
          setTimeout(() => {
            void this.router.navigate(['/dashboard']);
          }, 100);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage =
            err.error?.detail ?? 'Credenciales incorrectas o servidor inaccesible.';
        },
      });
  }
}
