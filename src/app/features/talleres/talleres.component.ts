import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // 🌟 Habilita directivas como *ngIf y [ngClass]
import { FormsModule } from '@angular/forms'; // 🌟 Soluciona el error con [(ngModel)] en el selector
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // 🚀 Url adaptativa automática
import { Taller } from '../../core/models/taller.model'; // 🌟 Importamos tu interfaz oficial
import { TallerService } from '../../core/services/taller.service';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule], // 🌟 Ambas herramientas declaradas para el HTML
  templateUrl: './talleres.component.html',
  styleUrls: ['./talleres.component.css'],
})
export class TalleresComponent implements OnInit {
  private tallerService = inject(TallerService); 
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // 🌟 Para forzar el refresco visual inmediato
  private API_URL = environment.apiUrl;

  // Arreglos de datos tipados formalmente
  talleres: Taller[] = [];
  listaGestores: any[] = []; // Almacena el personal con rol de Gestor de la empresa
  // Controladores de estados de carga en la UI
  isLoading = false;
  errorMessage = '';
  usuarioRol: string = '';

  // Variables de control para el sub-modal de Asignación Diferida (Opción B)
  modalGestorAbierto = false;
  tallerSeleccionado: Taller | null = null;
  idGestorSeleccionado: number | null = null;


  ngOnInit() {
    this.obtenerRolUsuario(); 
    // 🌟 SECUENCIA INVERSA ASINCRÓNICA:
    // Primero descargamos los gestores para tener el catálogo listo en memoria.
    this.cargarGestoresPrimero();
  }


  obtenerRolUsuario() {
    // Extraemos el rol guardado en el localStorage durante el login
    this.usuarioRol = localStorage.getItem('usuario_rol') || 'Gestor'; 
  }

  // Generador dinámico de cabeceras de autorización seguras
  getHeaders(): { headers: HttpHeaders } {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // 🌟 PASO 1: Garantizar la descarga del catálogo de usuarios/gestores
  cargarGestoresPrimero() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.API_URL}/usuarios/`, this.getHeaders()).subscribe({
      next: (usuarios: any[]) => {
        this.listaGestores = usuarios.filter(u => u.rol?.nombre === 'Gestor' || u.id_rol === 3);
        console.log('👤 1. Catálogo de Gestores listo en memoria:', this.listaGestores);
        
        // 🌟 PASO 2: Solo cuando los gestores ya están listos, llamamos a los talleres
        this.cargarTalleres();
      },
      error: (err: any) => {
        console.error('❌ Error cargando catálogo de gestores:', err);
        // Si falla el catálogo, de todas formas cargamos los talleres para no bloquear la pantalla
        this.cargarTalleres();
      }
    });
  }

  // Obtiene los talleres del Tenant actualizados desde PostgreSQL
  cargarTalleres() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Taller[]>(`${this.API_URL}/talleres/`, this.getHeaders()).subscribe({
      next: (data: Taller[]) => {
        this.talleres = data;
        console.log('📋 2. Talleres cargados y listos para cruzar datos:', this.talleres);
        this.isLoading = false;
        this.cdr.detectChanges(); // 🚀 Fuerza a Angular a repintar las filas de la tabla al instante
      },
      error: (err: any) => {
        console.error('❌ Error en GET /talleres/:', err);
        this.errorMessage = 'No se pudo sincronizar la lista de talleres con el servidor central.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // 🌟 PASO 3: Función de cruce síncrona en memoria pura
  obtenerNombreGestor(idGestor: number | null): string {
    if (!idGestor) return 'Sin Encargado';
    
    // Buscamos con el ID sobre la lista garantizada
    const gestorEncontrado = this.listaGestores.find(g => g.id_usuario === idGestor);
    
    if (gestorEncontrado) {
      return `${gestorEncontrado.nombre} ${gestorEncontrado.apellido}`;
    }
    return `ID Encargado #${idGestor}`;
  }

  // =========================================================================
  // 👤 ACCIONES DEL SUB-MODAL DE RESPONSABLE (ASIGNACIÓN DIFERIDA)
  // =========================================================================

  abrirModalAsignarGestor(taller: Taller) {
    this.tallerSeleccionado = taller;
    // Captura el ID actual, permitiendo que sea numérico o null de forma nativa
    this.idGestorSeleccionado = taller.id_gestor;
    this.modalGestorAbierto = true;
  }

  cerrarModalGestor() {
    this.modalGestorAbierto = false;
    this.tallerSeleccionado = null;
    this.idGestorSeleccionado = null;
    this.cdr.detectChanges(); // Oculta el div flotante en el mismo ciclo de ejecución
  }

  guardarAsignacionGestor() {
    if (!this.tallerSeleccionado) return;

    const idTaller = this.tallerSeleccionado.id_taller;

    this.tallerService.asignarGestor(idTaller, this.idGestorSeleccionado).subscribe({
      next: () => {
        alert('👤 ¡El encargado de la sucursal ha sido actualizado con éxito!');
        this.cerrarModalGestor();
        this.cargarTalleres(); // Recarga la grilla con los datos frescos de PostgreSQL
      },
      error: (err: any) => {
        console.error(err);
        alert(
          '❌ Error al procesar el cambio de personal: ' + (err.error?.detail || 'Error interno'),
        );
      },
    });
  }

  // =========================================================================
  // ⚙️ RESTO DE TUS MÉTODOS DE FORMULARIO (Mantén tus bloques lógicos aquí)
  // =========================================================================

  abrirModalCrear(): void {
    console.log('Abriendo formulario para registrar un taller.');
    // Aquí abrirás el diálogo inyectando las coordenadas de geolocalización
  }

  editarTaller(taller: Taller): void {
    console.log('Cargando datos en el formulario para editar:', taller.nombre);
    // Carga los datos existentes, mapeando el string 'ubicacion_wkt' a puntos editables
  }

  desactivarTaller(id: number, nombre: string): void {
    // Confirmación nativa antes de mandar la petición al backend
    if (
      confirm(
        `¿Estás seguro de que deseas dar de baja el taller: ${nombre}? (Se mantendrán los registros históricos)`,
      )
    ) {
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
}
