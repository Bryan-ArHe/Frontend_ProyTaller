import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioPerfil } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl">
      <h1 class="text-3xl font-bold mb-8">Mi Perfil</h1>

      @if (user) {
        <div class="bg-white rounded-lg shadow-md p-8 space-y-6">
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Nombre</label>
              <p class="text-lg text-gray-900">{{ user.nombre || 'No registrado' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Apellido</label>
              <p class="text-lg text-gray-900">{{ user.apellido || 'No registrado' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <p class="text-lg text-gray-900">{{ user.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Rol</label>
              <p class="text-lg text-gray-900">{{ getRoleName(user.id_rol) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Teléfono</label>
              <p class="text-lg text-gray-900">{{ user.telefono || 'Sin registrar' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Estado Cuenta</label>
              <p class="text-lg text-gray-900">{{ user.estado_cuenta }}</p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-4 pt-6 border-t">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Editar Perfil
            </button>
            <button
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      } @else {
        <p class="text-gray-500">Cargando información del perfil...</p>
      }
    </div>
  `,
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);

  user = this.authService.getCurrentUser();

  getRoleName(idRol: number): string {
    const roles: { [key: number]: string } = {
      1: 'Administrador',
      2: 'Operador',
      3: 'Técnico',
      4: 'Usuario',
      5: 'Gestor de Taller',
    };
    return roles[idRol] || 'Desconocido';
  }
}
