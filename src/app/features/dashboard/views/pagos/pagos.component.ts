import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Mis Pagos / Liquidaciones 💳</h1>
      <div class="bg-white rounded-lg shadow-md p-8">
        <p class="text-gray-600">
          Aquí irán los pagos y liquidaciones. Pendiente de implementación.
        </p>
      </div>
    </div>
  `,
})
export class PagosComponent {}
