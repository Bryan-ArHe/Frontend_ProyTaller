import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitor-triaje',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Monitor de Triaje IA 🤖</h1>
      <div class="bg-white rounded-lg shadow-md p-8">
        <p class="text-gray-600">
          Aquí irá el monitor de triaje IA para análisis de incidentes. Pendiente de implementación.
        </p>
      </div>
    </div>
  `,
})
export class MonitorTriajeComponent {}
