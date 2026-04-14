import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { LoginData } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 class="text-2xl font-semibold mb-6 text-center">Iniciar sesión</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
            <p
              class="text-red-600 text-sm mt-1"
              *ngIf="form.controls.email.touched && form.controls.email.invalid"
            >
              Ingresa un email válido.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
            <p
              class="text-red-600 text-sm mt-1"
              *ngIf="form.controls.password.touched && form.controls.password.invalid"
            >
              El password es obligatorio.
            </p>
          </div>

          <p class="text-red-600 text-sm" *ngIf="errorMessage">{{ errorMessage }}</p>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <p class="text-sm text-center">
            ¿No tienes cuenta?
            <a routerLink="/register" class="text-blue-600 hover:underline">Regístrate</a>
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

    const payload: LoginData = this.form.getRawValue();

    this.authService
      .login(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.detail ?? 'No se pudo iniciar sesión.';
        },
      });
  }
}
