import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);
  private readonly destroyRef = inject(DestroyRef);

  // Variables de sesión legibles
  userEmail = '';
  userName = '';
  userRol = '';
  fechaFormateada = '';

  constructor() {
    // Escucha reactiva al estado del usuario
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user) {
          this.userEmail = user.email;
        }
      });
  }

  ngOnInit(): void {
    this.cargarDatosContexto();
    this.inicializarFecha();
  }

  /**
   * Extrae los metadatos de sesión para personalizar el entorno del Tenant
   */
  private cargarDatosContexto(): void {
    // Si tienes el nombre guardado en el login lo extraes, de lo contrario usamos un fallback elegante
    this.userName = localStorage.getItem('usuario_nombre') || 'Bryan'; 
    this.userRol = localStorage.getItem('usuario_rol') || 'Administrador';
  }

  /**
   * Calcula la fecha una sola vez al inicio para evitar sobrecargar el ciclo de vida de Angular
   */
  private inicializarFecha(): void {
    const now = new Date();
    const fechaLetras = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    // Capitalizamos la primera letra (ej: "domingo" -> "Domingo")
    this.fechaFormateada = fechaLetras.charAt(0).toUpperCase() + fechaLetras.slice(1);
  }

  onLogout(): void {
    if (confirm('¿Deseas cerrar la sesión activa del sistema?')) {
      this.authService.logout();
    }
  }
}