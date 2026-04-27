import { Injectable, signal, computed } from '@angular/core';

/**
 * LayoutService
 * Gestiona el estado global del layout (sidebar abierto/cerrado)
 * Utiliza Signals para reactividad automática
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  // Signal que almacena el estado del sidebar
  private readonly sidebarOpen = signal<boolean>(false);

  // Computed signal para obtener el estado (read-only)
  readonly isSidebarOpen = this.sidebarOpen.asReadonly();

  // Computed signals para clases dinámicas
  readonly mainContentMargin = computed(() => (this.sidebarOpen() ? 'ml-64' : 'ml-0'));

  readonly headerPosition = computed(() => (this.sidebarOpen() ? 'left-64' : 'left-0'));

  readonly sidebarWidth = computed(() => (this.sidebarOpen() ? 'w-64' : 'w-0'));

  constructor() {
    // Detectar si es móvil y establecer sidebar cerrado por defecto
    this.initializeResponsive();
  }

  /**
   * Alterna el estado del sidebar
   */
  toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  /**
   * Abre el sidebar
   */
  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  /**
   * Cierra el sidebar
   */
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  /**
   * Establece el estado del sidebar
   */
  setSidebarState(isOpen: boolean): void {
    this.sidebarOpen.set(isOpen);
  }

  /**
   * Inicializa el estado responsivo
   * En móviles, el sidebar comienza cerrado
   */
  private initializeResponsive(): void {
    // Ejecutar en el navegador únicamente
    if (typeof window !== 'undefined') {
      // Sidebar cerrado en pantallas pequeñas por defecto
      const isMobile = window.innerWidth < 768; // md breakpoint de Tailwind
      this.sidebarOpen.set(!isMobile);

      // Escuchar cambios de tamaño de ventana
      window.addEventListener('resize', () => {
        const isNowMobile = window.innerWidth < 768;
        if (isNowMobile && this.sidebarOpen()) {
          this.closeSidebar();
        }
      });
    }
  }
}
