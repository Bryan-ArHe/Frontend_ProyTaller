import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="bg-white shadow-md h-16 fixed top-0 left-64 right-0 flex items-center justify-between px-8 z-50"
    >
      <!-- Saludo -->
      <div>
        <h2 class="text-xl font-bold text-gray-800">Bienvenido, {{ userEmail }}</h2>
        <p class="text-sm text-gray-500">{{ getCurrentTime() }}</p>
      </div>

      <!-- Botón Cerrar Sesión -->
      <button
        (click)="onLogout()"
        class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        <span>🚪</span>
        <span>Cerrar Sesión</span>
      </button>
    </header>
  `,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  userEmail = '';

  constructor() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userEmail = user.email;
      }
    });
  }

  onLogout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
