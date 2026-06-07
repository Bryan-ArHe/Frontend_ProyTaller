import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../core/services/empresa.service';
import { EmpresaSaaS } from '../../core/models/empresa.model';
import { environment } from '../../../environments/environment'; // 🌟 Se adapta solo local y en la nube

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresas.component.html'
})
export class EmpresasComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  // 🌟 Usamos la variable de entorno global para evitar cambios manuales en producción
  private API_URL = environment.apiUrl; 

  listaEmpresas: EmpresaSaaS[] = [];
  empresaSeleccionada: EmpresaSaaS | null = null;
  
  modalAbierto = false;
  modoEdit = false;

  formEmpresa: EmpresaSaaS = { nombre: '', apellido: '', email: '', password: '', telefono: '' };
  idPlanSeleccionado = 1;
  estadoSeleccionado = 'Activo';

  ngOnInit() {
    this.cargarEmpresas();
  }

  getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  localStorage.getItem('auth_token'); 
     
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
     
    return { headers };
  }

  cargarEmpresas() {
    this.http.get<any[]>(`${this.API_URL}/usuarios/`, this.getHeaders()).subscribe({
      next: (data: any[]) => {
        this.listaEmpresas = data.filter((u: any) => u.rol?.nombre === 'Administrador');
        console.log('🏢 Empresas cargadas con éxito:', this.listaEmpresas);
      },
      error: (err: any) => {
        console.error('❌ Error cargando empresas:', err);
        alert('No se pudieron obtener los administradores.');
      }
    });
  }

  abrirModalParaCrear() {
    this.modoEdit = false;
    this.formEmpresa = { nombre: '', apellido: '', email: '', password: '', telefono: '' };
    this.idPlanSeleccionado = 1;
    this.estadoSeleccionado = 'Activo';
    this.modalAbierto = true;
  }

  abrirModalParaEditar(empresa: EmpresaSaaS) {
    this.modoEdit = true;
    this.empresaSeleccionada = empresa;
    this.idPlanSeleccionado = empresa.suscripciones?.[0]?.id_plan || 1;
    this.estadoSeleccionado = empresa.suscripciones?.[0]?.estado_suscripcion || 'Activo';
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.empresaSeleccionada = null;
  }

  guardarCambios() {
    if (this.modoEdit) {
      if (!this.empresaSeleccionada || !this.empresaSeleccionada.id_usuario) return;
      
      this.empresaService.actualizarSuscripcion(this.empresaSeleccionada.id_usuario, this.idPlanSeleccionado, this.estadoSeleccionado).subscribe({
        next: () => {
          alert('📦 ¡Límites de la empresa actualizados con éxito!');
          this.cerrarModal();
          this.cargarEmpresas();
        },
        error: (err: any) => alert('❌ Error al actualizar suscripción.')
      });

    } else {
      const payloadUsuario = {
        nombre: this.formEmpresa.nombre,
        apellido: this.formEmpresa.apellido,
        email: this.formEmpresa.email,
        password: this.formEmpresa.password || '12345678',
        telefono: this.formEmpresa.telefono,
        id_rol: 2, 
        estado_cuenta: 'ACTIVO'
      };

      this.empresaService.crearEmpresa(payloadUsuario).subscribe({
        next: (nuevoUsuario) => {
          const idNuevo = nuevoUsuario.id_usuario || nuevoUsuario.id;
          this.vincularPlanSaaS(idNuevo);
        },
        error: (err: any) => { // 🌟 Tipado estricto :any agregado para evitar el error TS7006
          if (err.status === 400 && err.error?.detail?.includes('ya está registrado')) {
            console.log('📌 El administrador ya existe. Procediendo a registrar/actualizar el plan SaaS...');
            
            const usuarioExistente = this.listaEmpresas.find(u => u.email.toLowerCase() === this.formEmpresa.email.toLowerCase());
            
            if (usuarioExistente && usuarioExistente.id_usuario) {
              this.vincularPlanSaaS(usuarioExistente.id_usuario);
            } else {
              alert('❌ El correo ya está registrado en el sistema, pero pertenece a un rol diferente o no se pudo mapear su ID.');
            }
          } else {
            alert('❌ Error al registrar el usuario Administrador: ' + (err.error?.detail || 'Error desconocido'));
          }
        }
      });
    }
  }

  private vincularPlanSaaS(idUsuarioAdmin: number) {
    this.empresaService.actualizarSuscripcion(idUsuarioAdmin, this.idPlanSeleccionado, this.estadoSeleccionado).subscribe({
      next: () => {
        alert('🏢 ¡Operación exitosa! El Plan SaaS ha sido registrado/actualizado para este administrador.');
        this.cerrarModal();
        this.cargarEmpresas();
      },
      error: (err: any) => alert('⚠ El usuario está activo, pero ocurrió un error al impactar la tabla de suscripciones en PostgreSQL.')
    });
  }
}