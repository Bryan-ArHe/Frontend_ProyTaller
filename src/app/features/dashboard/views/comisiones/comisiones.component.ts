import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comisiones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Panel de Comisiones 📊</h1>
      <div class="bg-white rounded-lg shadow-md p-8">
        <p class="text-gray-600">
          Aquí irá el panel de comisiones del sistema. Pendiente de implementación.
        </p>
      </div>
    </div>
  `,
})
export class ComisionesComponent {}
