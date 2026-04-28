import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TecnicoService } from '../../../../core/services/tecnico.service';
import { Tecnico } from '../../../../core/models/tecnico.model';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tecnicos.component.html',
  styleUrl: './tecnicos.component.css'
})
export class TecnicosComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  tecnicos: Tecnico[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  // Inyectamos el servicio para hablar con FastAPI
  constructor(private tecnicoService: TecnicoService) {}

  // Este método se ejecuta automáticamente al abrir la pantalla
  ngOnInit(): void {
    this.cargarTecnicos();
  }

  // --- MÉTODOS Y ACCIONES ---

  /**
   * Pide la lista de técnicos al servidor.
   */
  cargarTecnicos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tecnicoService.getTecnicos().subscribe({
      next: (data) => {
        this.tecnicos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar técnicos', err);
        this.errorMessage = 'Ocurrió un problema al cargar los técnicos.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Acción para el botón de "Dar de Baja"
   */
  desactivarTecnico(id: number): void {
    if (confirm('¿Estás seguro de que deseas dar de baja a este técnico?')) {
      this.tecnicoService.deleteTecnico(id).subscribe({
        next: () => {
          alert('Técnico dado de baja exitosamente.');
          this.cargarTecnicos(); // Recargamos la tabla para ver los cambios
        },
        error: (err) => {
          console.error('Error al dar de baja', err);
          alert('Ocurrió un error al intentar desactivar al técnico.');
        }
      });
    }
  }

  // --- PREPARACIÓN PARA FORMULARIOS (Siguientes pasos) ---
  
  abrirModalCrear(): void {
    console.log("Se abrirá el formulario para asignar un nuevo técnico.");
    // Aquí implementaremos la lógica del formulario más adelante
  }

  editarTecnico(tecnico: Tecnico): void {
    console.log("Cargando datos del técnico para editar:", tecnico.id_tecnico);
    // Aquí implementaremos la lógica de edición
  }
}