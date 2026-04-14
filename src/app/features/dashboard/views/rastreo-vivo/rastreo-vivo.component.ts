import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rastreo-vivo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Rastreo en Vivo 🗺️</h1>
      <div class="bg-white rounded-lg shadow-md p-8">
        <p class="text-gray-600">
          Aquí irá el mapa de rastreo en vivo de vehículos. Pendiente de implementación.
        </p>
      </div>
    </div>
  `,
})
export class RastreoVivoComponent {}
