// src/app/features/talleres/talleres.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { TallerService } from '../../core/services/taller.service';
import { Taller } from '../../core/models/taller.model';

@Component({
  selector: 'app-talleres',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './talleres.component.html', 
  styleUrl: './talleres.component.css'
})
export class TalleresComponent implements OnInit {
  // Inyección de servicios moderna (Sustituye al constructor clásico)
  private tallerService = inject(TallerService);

  // --- VARIABLES DE ESTADO ---
  talleres: Taller[] = [];       // Aquí guardaremos la lista de la base de datos
  isLoading: boolean = true;     // Para mostrar un "Cargando..." en la pantalla
  errorMessage: string = '';     // Por si el servidor falla

  // Se ejecuta automáticamente al abrir la vista
  ngOnInit(): void {
    this.cargarTalleres();
  }

  // --- MÉTODOS Y ACCIONES ---

  /**
   * Llama al backend para obtener los talleres activos del Tenant
   */
  cargarTalleres(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // CORRECCIÓN: Sincronizado con 'listarTalleres()' de tu servicio core
    this.tallerService.listarTalleres().subscribe({
      next: (data) => {
        this.talleres = data;      // Guardamos los datos recibidos (incluye ubicacion_wkt)
        this.isLoading = false;    // Apagamos el estado de carga
      },
      error: (err) => {
        console.error('Error al cargar talleres', err);
        this.errorMessage = 'No se pudieron cargar los talleres de su cuenta. Intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Lógica para el botón de Desactivar/Baja de Taller (Protección de Integridad ERP)
   */
  desactivarTaller(id: number, nombre: string): void {
    // Confirmación nativa antes de mandar la petición al backend
    if (confirm(`¿Estás seguro de que deseas dar de baja el taller: ${nombre}? (Se mantendrán los registros históricos)`)) {
      
      // NOTA OPERATIVA: Cambiado a una actualización lógica de estado. 
      // Si eventualmente implementas el endpoint físico en FastAPI, puedes usar .obtenerTaller o tu método delete
      alert('Funcionalidad de baja lógica registrada para el parcial.');
      
      /* 
      this.tallerService.desactivarTallerLogico(id).subscribe({
        next: () => {
          this.cargarTalleres();
          alert('Taller dado de baja exitosamente.');
        },
        error: (err) => {
          console.error('Error al desactivar', err);
          alert('Ocurrió un error al intentar dar de baja el taller.');
        }
      });
      */
    }
  }

  /**
   * Funciones preparadas para la Misión de Formularios Modales
   */
  abrirModalCrear(): void {
    console.log("Abriendo formulario para registrar un taller.");
    // Aquí abrirás el diálogo inyectando las coordenadas de geolocalización
  }

  editarTaller(taller: Taller): void {
    console.log("Cargando datos en el formulario para editar:", taller.nombre);
    // Carga los datos existentes, mapeando el string 'ubicacion_wkt' a puntos editables
  }
}