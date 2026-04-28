import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <!-- Botón Hamburguesa -->
      <button
        class="hamburger-btn"
        (click)="layoutService.toggleSidebar()"
        [class.active]="layoutService.isSidebarOpen()"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Saludo -->
      <div class="header-left">
        <div class="user-greeting">
          <h2 class="greeting-title">Bienvenido, {{ userEmail }}</h2>
          <p class="greeting-time">{{ getCurrentTime() }}</p>
        </div>
      </div>

      <!-- Botón Cerrar Sesión -->
      <button class="logout-btn" (click)="onLogout()">
        <span class="logout-icon">🚪</span>
        <span class="logout-text">Cerrar Sesión</span>
      </button>
    </header>
  `,
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);
  private readonly destroyRef = inject(DestroyRef);

  userEmail = '';
  

  constructor() {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
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

