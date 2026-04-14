import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidenteService } from '../../core/services/incidente.service';
import { IncidenteRequest } from '../../core/models/incidente.model';

@Component({
  selector: 'app-reportar-incidente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Encabezado crítico -->
        <div class="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🆘</span>
            <div>
              <h1 class="text-3xl font-bold text-red-900">Reportar Emergencia</h1>
              <p class="text-red-700 mt-1">
                Proporciona información precisa para recibir ayuda rápida
              </p>
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Ubicación (Geolocalización) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Latitud
                @if (!ubicacionObtenida) {
                  <button
                    type="button"
                    (click)="obtenerUbicacion()"
                    class="ml-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    📍 Obtener
                  </button>
                }
              </label>
              <input
                type="number"
                formControlName="latitud"
                placeholder="Ej: 4.7110"
                step="0.0001"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
                readonly
              />
              @if (form.get('latitud')?.touched && form.get('latitud')?.invalid) {
                <p class="text-red-600 text-sm mt-1">Latitud requerida</p>
              }
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Longitud</label>
              <input
                type="number"
                formControlName="longitud"
                placeholder="Ej: -74.0721"
                step="0.0001"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
                readonly
              />
              @if (form.get('longitud')?.touched && form.get('longitud')?.invalid) {
                <p class="text-red-600 text-sm mt-1">Longitud requerida</p>
              }
            </div>
          </div>

          @if (errorUbicacion) {
            <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p class="text-yellow-700">⚠️ {{ errorUbicacion }}</p>
            </div>
          }

          <!-- Descripción detallada -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Descripción de la Emergencia
            </label>
            <textarea
              formControlName="descripcion"
              placeholder="Describe lo que sucedió: tipo de emergencia, daños, lesionados, etc."
              rows="5"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors resize-none"
            ></textarea>
            @if (form.get('descripcion')?.touched && form.get('descripcion')?.invalid) {
              <p class="text-red-600 text-sm mt-1">La descripción es requerida</p>
            }
          </div>

          <!-- Evidencias (URLs) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Evidencias (URLs de fotos/video)
            </label>
            <div class="space-y-3 mb-4">
              @for (evidencia of evidencias; track $index) {
                <div class="flex gap-2">
                  <input
                    type="url"
                    [(ngModel)]="evidencias[$index]"
                    [ngModelOptions]="{ standalone: true }"
                    placeholder="https://example.com/foto.jpg"
                    class="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <button
                    type="button"
                    (click)="removeEvidencia($index)"
                    class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-3 rounded-lg transition-colors"
                  >
                    ❌
                  </button>
                </div>
              }
            </div>
            <button
              type="button"
              (click)="addEvidencia()"
              class="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              + Agregar evidencia
            </button>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-4 pt-8">
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
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors duration-200 text-lg flex items-center justify-center gap-2"
            >
              @if (enviando) {
                <span class="animate-spin">⚙️</span>
                <span>Enviando SOS...</span>
              } @else {
                <span>🆘</span>
                <span>Enviar Reporte de Emergencia</span>
              }
            </button>
          </div>

          <!-- Mensaje de error -->
          @if (error) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-700">❌ {{ error }}</p>
            </div>
          }

          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-700 text-sm">
              ℹ️ Tu ubicación exacta será enviada junto con el reporte para que el equipo de
              emergencia te localice rápidamente.
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ReportarIncidenteComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly incidenteService = inject(IncidenteService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    latitud: [0, [Validators.required]],
    longitud: [0, [Validators.required]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
  });

  evidencias: string[] = [];
  ubicacionObtenida = false;
  enviando = false;
  error: string | null = null;
  errorUbicacion: string | null = null;

  ngOnInit(): void {
    this.obtenerUbicacion();
  }

  /**
   * Obtiene la ubicación actual del usuario
   */
  obtenerUbicacion(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.form.patchValue({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          });
          this.ubicacionObtenida = true;
          this.errorUbicacion = null;
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          this.errorUbicacion =
            'No se pudo obtener tu ubicación. Ingresa las coordenadas manualmente.';
        },
      );
    } else {
      this.errorUbicacion = 'Tu navegador no soporta geolocalización.';
    }
  }

  /**
   * Añade una nueva evidencia
   */
  addEvidencia(): void {
    this.evidencias.push('');
  }

  /**
   * Elimina una evidencia
   */
  removeEvidencia(index: number): void {
    this.evidencias.splice(index, 1);
  }

  /**
   * Envía el reporte de incidente
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.error = null;

    const payload: IncidenteRequest = {
      latitud: this.form.get('latitud')?.value || 0,
      longitud: this.form.get('longitud')?.value || 0,
      descripcion: this.form.get('descripcion')?.value || '',
      evidencias: this.evidencias.filter((e) => e.trim().length > 0),
    };

    this.incidenteService.reportarIncidente(payload).subscribe({
      next: (respuesta) => {
        this.enviando = false;
        alert('✅ Reporte enviado exitosamente. Tu ID de emergencia es: ' + respuesta.id);
        void this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.error('Error reportando incidente:', err);
        this.error = err.error?.detail ?? 'No se pudo enviar el reporte';
        this.enviando = false;
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['dashboard']);
  }
}
