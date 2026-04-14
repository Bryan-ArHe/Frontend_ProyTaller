import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { VehiculoResponse } from '../../core/models/vehiculo.model';

@Component({
  selector: 'app-lista-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mis Vehículos</h1>
          <p class="text-gray-600 mt-2">Gestiona tus vehículos registrados en la plataforma</p>
        </div>
        <a
          routerLink="nuevo"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <span>➕</span>
          <span>Añadir Vehículo</span>
        </a>
      </div>

      <!-- Indicador de carga -->
      @if (cargando) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Mensaje de error -->
      @if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700 font-semibold">❌ Error</p>
          <p class="text-red-600 mt-1">{{ error }}</p>
        </div>
      }

      <!-- Lista de vehículos (tarjetas) -->
      @if (!cargando && !error && vehiculos.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (vehiculo of vehiculos; track vehiculo.id) {
            <div
              class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center"
              >
                <span class="text-6xl">🚗</span>
              </div>
              <div class="p-6">
                <!-- Placa -->
                <div class="mb-4">
                  <p class="text-xs text-gray-500 font-semibold uppercase">Placa</p>
                  <p class="text-2xl font-bold text-gray-900">{{ vehiculo.placa }}</p>
                </div>

                <!-- Detalles -->
                <div class="space-y-3 mb-6">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Marca</span>
                    <span class="font-semibold text-gray-900">{{ vehiculo.marca_nombre }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Modelo</span>
                    <span class="font-semibold text-gray-900">{{ vehiculo.modelo_nombre }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Año</span>
                    <span class="font-semibold text-gray-900">{{ vehiculo.anio }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Color</span>
                    <div class="flex items-center gap-2">
                      <div
                        class="w-6 h-6 rounded-full border-2 border-gray-300"
                        [style.backgroundColor]="vehiculo.color"
                      ></div>
                      <span class="font-semibold text-gray-900 capitalize">{{
                        vehiculo.color
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-2">
                  <button
                    (click)="eliminarVehiculo(vehiculo.id)"
                    class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition-colors duration-200"
                  >
                    🗑️ Eliminar
                  </button>
                  <button
                    class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg transition-colors duration-200"
                  >
                    ℹ️ Detalles
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Mensaje sin vehículos -->
      @if (!cargando && !error && vehiculos.length === 0) {
        <div class="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-12 text-center">
          <p class="text-4xl mb-4">🚗</p>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay vehículos registrados</h3>
          <p class="text-gray-600 mb-6">
            Añade tu primer vehículo para empezar a reportar incidentes
          </p>
          <a
            routerLink="nuevo"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Registrar Vehículo
          </a>
        </div>
      }
    </div>
  `,
})
export class ListaVehiculosComponent implements OnInit {
  private readonly vehiculoService = inject(VehiculoService);

  vehiculos: VehiculoResponse[] = [];
  cargando = true;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  private cargarVehiculos(): void {
    this.cargando = true;
    this.error = null;

    this.vehiculoService.getMisVehiculos().subscribe({
      next: (datos) => {
        this.vehiculos = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando vehículos:', err);
        this.error = 'No se pudieron cargar los vehículos. Intenta de nuevo.';
        this.cargando = false;
      },
    });
  }

  eliminarVehiculo(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      this.vehiculoService.eliminarVehiculo(id).subscribe({
        next: () => {
          this.vehiculos = this.vehiculos.filter((v) => v.id !== id);
        },
        error: (err) => {
          console.error('Error eliminando vehículo:', err);
          alert('No se pudo eliminar el vehículo.');
        },
      });
    }
  }
}
