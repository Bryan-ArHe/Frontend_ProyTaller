import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioCreate } from '../../core/models/auth.model';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 class="text-2xl font-semibold mb-6 text-center">Registro</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="text"
              formControlName="telefono"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              formControlName="nombre"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Apellido</label>
            <input
              type="text"
              formControlName="apellido"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ID Rol</label>
            <input
              type="number"
              formControlName="id_rol"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <p class="text-red-600 text-sm" *ngIf="errorMessage">{{ errorMessage }}</p>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {{ loading ? 'Registrando...' : 'Crear cuenta' }}
          </button>

          <p class="text-sm text-center">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-blue-600 hover:underline">Inicia sesión</a>
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

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(7)]],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    id_rol: [1, [Validators.required, Validators.min(1)]],
  });

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
          this.errorMessage = err.error?.detail ?? 'No se pudo registrar el usuario.';
        },
      });
  }
}
