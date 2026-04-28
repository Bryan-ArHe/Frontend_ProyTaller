import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas en el HTML
import { TallerService } from '../../../../core/services/taller.service';
import { Taller } from '../../../../core/models/taller.model';

@Component({
  selector: 'app-talleres',
  standalone: true, // Asumiendo que usas Angular moderno (Componentes Standalone)
  imports: [CommonModule],
  templateUrl: './talleres.component.html', // En la Misión 8 tocaremos este archivo
  styleUrl: './talleres.component.css'
})
export class TalleresComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  talleres: Taller[] = [];       // Aquí guardaremos la lista de la base de datos
  isLoading: boolean = true;     // Para mostrar un "Cargando..." en la pantalla
  errorMessage: string = '';     // Por si el servidor falla

  // Inyectamos nuestro servicio de comunicación
  constructor(private tallerService: TallerService) {}

  // Se ejecuta automáticamente al abrir la vista
  ngOnInit(): void {
    this.cargarTalleres();
  }

  // --- MÉTODOS Y ACCIONES ---

  /**
   * Llama al backend para obtener los talleres activos
   */
  cargarTalleres(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Nos suscribimos a la respuesta del Observable (la llamada HTTP)
    this.tallerService.getTalleres().subscribe({
      next: (data) => {
        this.talleres = data;      // Guardamos los datos recibidos
        this.isLoading = false;    // Apagamos el estado de carga
      },
      error: (err) => {
        console.error('Error al cargar talleres', err);
        this.errorMessage = 'No se pudieron cargar los talleres. Intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Lógica para el botón de Desactivar/Eliminar Taller
   */
  desactivarTaller(id: number, nombre: string): void {
    // Una confirmación nativa simple antes de ejecutar una acción destructiva
    if (confirm(`¿Estás seguro de que deseas dar de baja el taller: ${nombre}?`)) {
      this.tallerService.deleteTaller(id).subscribe({
        next: () => {
          // Si el backend confirma la eliminación, volvemos a cargar la tabla
          this.cargarTalleres();
          alert('Taller dado de baja exitosamente.');
        },
        error: (err) => {
          console.error('Error al desactivar', err);
          alert('Ocurrió un error al intentar dar de baja el taller.');
        }
      });
    }
  }

  /**
   * Funciones preparadas para la Misión 8 (Formularios)
   */
  abrirModalCrear(): void {
    console.log("Aquí se abrirá el modal o formulario para registrar un taller.");
    // Lógica futura para formularios
  }

  editarTaller(taller: Taller): void {
    console.log("Cargando datos en el formulario para editar:", taller.nombre);
    // Lógica futura para formularios
  }
}