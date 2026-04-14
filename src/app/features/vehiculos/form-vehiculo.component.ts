import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { Marca, Modelo } from '../../core/models/vehiculo.model';

@Component({
  selector: 'app-form-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Encabezado -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Registrar Nuevo Vehículo</h1>
          <p class="text-gray-600 mt-2">Completa todos los campos para agregar tu vehículo</p>
        </div>

        <!-- Formulario -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Placa -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Placa del Vehículo
            </label>
            <input
              type="text"
              formControlName="placa"
              placeholder="Ej: ABC-123"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
            />
            @if (form.get('placa')?.touched && form.get('placa')?.invalid) {
              <p class="text-red-600 text-sm mt-1">La placa es requerida</p>
            }
          </div>

          <!-- Marca (Desplegable) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
            <select
              formControlName="id_marca"
              (change)="onMarcaChange()"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="">Selecciona una marca</option>
              @for (marca of marcas; track marca.id) {
                <option [value]="marca.id">{{ marca.nombre }}</option>
              }
            </select>
            @if (form.get('id_marca')?.touched && form.get('id_marca')?.invalid) {
              <p class="text-red-600 text-sm mt-1">La marca es requerida</p>
            }
          </div>

          <!-- Modelo (Desplegable dependiente) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
            <select
              formControlName="id_modelo"
              [disabled]="modelos.length === 0"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors disabled:bg-gray-100"
            >
              <option value="">
                @if (modelos.length === 0) {
                  Selecciona una marca primero
                } @else {
                  Selecciona un modelo
                }
              </option>
              @for (modelo of modelos; track modelo.id) {
                <option [value]="modelo.id">{{ modelo.nombre }}</option>
              }
            </select>
            @if (form.get('id_modelo')?.touched && form.get('id_modelo')?.invalid) {
              <p class="text-red-600 text-sm mt-1">El modelo es requerido</p>
            }
          </div>

          <!-- Año -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Año</label>
            <input
              type="number"
              formControlName="anio"
              placeholder="2024"
              min="1990"
              [max]="currentYear"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
            />
            @if (form.get('anio')?.touched && form.get('anio')?.invalid) {
              <p class="text-red-600 text-sm mt-1">Ingresa un año válido</p>
            }
          </div>

          <!-- Color -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Color</label>
            <input
              type="text"
              formControlName="color"
              placeholder="Ej: Blanco, Negro, Azul"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
            />
            @if (form.get('color')?.touched && form.get('color')?.invalid) {
              <p class="text-red-600 text-sm mt-1">El color es requerido</p>
            }
          </div>

          <!-- Botones -->
          <div class="flex gap-4 pt-6">
            <button
              type="button"
              (click)="onCancel()"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || enviando"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              @if (enviando) {
                <span class="animate-spin">⚙️</span>
                <span>Registrando...</span>
              } @else {
                <span>✅</span>
                <span>Registrar Vehículo</span>
              }
            </button>
          </div>

          <!-- Mensaje de error -->
          @if (error) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-700">❌ {{ error }}</p>
            </div>
          }
        </form>
      </div>
    </div>
  `,
})
export class FormVehiculoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    placa: ['', [Validators.required]],
    id_marca: [0, [Validators.required, Validators.min(1)]],
    id_modelo: [0, [Validators.required, Validators.min(1)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    color: ['', [Validators.required]],
  });

  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  enviando = false;
  error: string | null = null;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.cargarMarcas();
  }

  private cargarMarcas(): void {
    this.vehiculoService.getMarcas().subscribe({
      next: (datos) => {
        this.marcas = datos;
      },
      error: (err) => {
        console.error('Error cargando marcas:', err);
        this.error = 'No se pudieron cargar las marcas';
      },
    });
  }

  onMarcaChange(): void {
    const idMarca = this.form.get('id_marca')?.value;
    this.form.get('id_modelo')?.reset();
    this.modelos = [];

    if (idMarca) {
      this.vehiculoService.getModelosByMarca(Number(idMarca)).subscribe({
        next: (datos) => {
          this.modelos = datos;
        },
        error: (err) => {
          console.error('Error cargando modelos:', err);
          this.error = 'No se pudieron cargar los modelos';
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.error = null;

    const payload = this.form.getRawValue();

    this.vehiculoService.crearVehiculo(payload).subscribe({
      next: () => {
        this.enviando = false;
        void this.router.navigate(['dashboard', 'vehiculos']);
      },
      error: (err) => {
        console.error('Error creando vehículo:', err);
        this.error = err.error?.detail ?? 'No se pudo crear el vehículo';
        this.enviando = false;
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['dashboard', 'vehiculos']);
  }
}
