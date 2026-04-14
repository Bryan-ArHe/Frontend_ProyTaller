import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ordenes-trabajo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Órdenes de Trabajo</h1>
      <div class="bg-white rounded-lg shadow-md p-8">
        <p class="text-gray-600">
          Aquí irán las órdenes de trabajo para despacho operativo. Pendiente de implementación.
        </p>
      </div>
    </div>
  `,
})
export class OrdenesTrabajoComponent {}
