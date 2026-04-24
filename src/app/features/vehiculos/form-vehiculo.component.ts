import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { VehiculoRequest } from '../../core/models/vehiculo.model';

@Component({
  selector: 'app-form-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Registrar Nuevo Vehículo</h1>
          <p class="text-gray-600 mt-2">Completa todos los campos para agregar tu vehículo</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Placa del Vehículo
            </label>
            <input
              type="text"
              formControlName="placa"
              placeholder="Ej: ABC-1234"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors uppercase"
            />
            @if (form.get('placa')?.touched && form.get('placa')?.invalid) {
              <p class="text-red-600 text-sm mt-1">La placa es requerida</p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
            <select
              formControlName="marca"
              (change)="onMarcaChange()"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="">Selecciona una marca</option>
              @for (marca of listaMarcas; track marca) {
                <option [value]="marca">{{ marca }}</option>
              }
            </select>
            @if (form.get('marca')?.touched && form.get('marca')?.invalid) {
              <p class="text-red-600 text-sm mt-1">La marca es requerida</p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
            <select
              formControlName="modelo"
              [disabled]="modelosDisponibles.length === 0"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                @if (modelosDisponibles.length === 0) {
                  Selecciona una marca primero
                } @else {
                  Selecciona un modelo
                }
              </option>
              @for (modelo of modelosDisponibles; track modelo) {
                <option [value]="modelo">{{ modelo }}</option>
              }
            </select>
            @if (form.get('modelo')?.touched && form.get('modelo')?.invalid) {
              <p class="text-red-600 text-sm mt-1">El modelo es requerido</p>
            }
          </div>

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

  // 1. Catálogo Estático Integrado (No requiere base de datos para funcionar)
  catalogoVehiculos: Record<string, string[]> = {
    'Toyota': ['Corolla', 'Hilux', 'Yaris', 'RAV4', 'Land Cruiser', 'Rush', 'Avanza'],
    'Nissan': ['Sentra', 'Frontier', 'Versa', 'Kicks', 'Patrol', 'March'],
    'Suzuki': ['Swift', 'Vitara', 'Jimny', 'Celerio', 'Alto', 'Ertiga'],
    'Volkswagen': ['Golf', 'Polo', 'Amarok', 'Jetta', 'Gol', 'Taos', 'T-Cross'],
    'Ford': ['Fiesta', 'Ranger', 'Explorer', 'Mustang', 'EcoSport', 'F-150'],
    'Hyundai': ['Tucson', 'Accent', 'Elantra', 'Santa Fe', 'i10', 'Creta'],
    'Renault': ['Duster', 'Kwid', 'Stepway', 'Logan', 'Sandero', 'Oroch'],
    'Chevrolet': ['Tracker', 'Onix', 'Cruze', 'S10', 'Spark', 'Captiva'],
    'Honda': ['Civic', 'CR-V', 'HR-V', 'City', 'Fit'],
    'Kia': ['Sportage', 'Rio', 'Sorento', 'Cerato', 'Picanto']
  };

  // 2. Extraemos las marcas para el primer Select (ordenadas alfabéticamente)
  listaMarcas: string[] = Object.keys(this.catalogoVehiculos).sort();
  
  // 3. Arreglo que se llenará al elegir una marca
  modelosDisponibles: string[] = [];

  // 4. Formulario reactivo ajustado (ahora usa strings para marca/modelo)
  form = this.fb.nonNullable.group({
    placa: ['', [Validators.required]],
    marca: ['', [Validators.required]],
    modelo: ['', [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    color: ['', [Validators.required]],
  });

  enviando = false;
  error: string | null = null;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    // Ya no hacemos peticiones HTTP al iniciar
  }

  // 5. Lógica de cascada
  onMarcaChange(): void {
    const marcaSeleccionada = this.form.get('marca')?.value;
    
    // Reseteamos el modelo al cambiar de marca
    this.form.get('modelo')?.setValue(''); 
    
    if (marcaSeleccionada && this.catalogoVehiculos[marcaSeleccionada]) {
      // Cargamos y ordenamos los modelos correspondientes
      this.modelosDisponibles = this.catalogoVehiculos[marcaSeleccionada].sort();
    } else {
      this.modelosDisponibles = [];
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  
    this.enviando = true;
    this.error = null;

    const rawForm = this.form.getRawValue();

    // Armamos el objeto campo por campo para asegurar los tipos
    const payload: VehiculoRequest = {
      marca: rawForm.marca,
      modelo: rawForm.modelo,
      anio: rawForm.anio,
      color: rawForm.color,
      // Usamos un operador ternario para asegurar que placa siempre sea un string
      placa: rawForm.placa ? rawForm.placa.toUpperCase() : '', 
      
      // id_cliente: 4  // <-- Descomenta y pon tu variable si tu backend exige este dato
    };

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

  // Agrega este método para que el botón de cancelar funcione
  onCancel(): void {
    // Te regresa a la tabla o lista de vehículos
    void this.router.navigate(['dashboard', 'vehiculos']);
  }
}