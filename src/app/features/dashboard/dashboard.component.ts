import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
        <p class="text-gray-700 mb-6">Ruta protegida por authGuard.</p>
        <button
          type="button"
          (click)="logout()"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
