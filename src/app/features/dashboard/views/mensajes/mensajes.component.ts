import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Bandeja de Mensajes 💬</h1>
      <div class="bg-white rounded-lg shadow-md p-8">
        <p class="text-gray-600">
          Aquí irá la bandeja de mensajes del sistema. Pendiente de implementación.
        </p>
      </div>
    </div>
  `,
})
export class MensajesComponent {}
