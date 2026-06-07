import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../core/services/empresa.service';
import { EmpresaSaaS } from '../../core/models/empresa.model';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresas.component.html' // Lo separamos de la vista para entenderlo mejor
})
export class EmpresasComponent implements OnInit {
  private empresaService = inject(EmpresaService);

  listaEmpresas: EmpresaSaaS[] = [];
  empresaSeleccionada: EmpresaSaaS | null = null;
  
  modalAbierto = false;
  modoEdit = false;

  // Formulario para enlazar con los Inputs del HTML
  formEmpresa: EmpresaSaaS = { nombre: '', apellido: '', email: '', password: '', telefono: '' };
  idPlanSeleccionado = 1;
  estadoSeleccionado = 'Activo';

  ngOnInit() {
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.empresaService.getEmpresas().subscribe({
      next: (data) => {
        // Filtramos para mostrar solo los que tienen el rol de Administrador de talleres
        this.listaEmpresas = data.filter(u => u.rol?.nombre === 'Administrador');
      },
      error: (err) => console.error('Error al cargar Tenants:', err)
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
        error: (err) => alert('❌ Error al actualizar suscripción.')
      });
    } else {
      const payloadUsuario: EmpresaSaaS = {
        ...this.formEmpresa,
        password: this.formEmpresa.password || '12345678',
        // Le pasamos el ID de rol correspondiente a Administrador corporativo (ej: 2)
      };

      // Hacemos el flujo encadenado convencional
      this.empresaService.crearEmpresa(payloadUsuario).subscribe({
        next: (nuevoUsuario) => {
          const idNuevo = nuevoUsuario.id_usuario || nuevoUsuario.id;
          
          this.empresaService.actualizarSuscripcion(idNuevo, this.idPlanSeleccionado, this.estadoSeleccionado).subscribe({
            next: () => {
              alert('🏢 ¡Nueva empresa registrada y plan activado!');
              this.cerrarModal();
              this.cargarEmpresas();
            },
            error: (err) => alert('⚠ Usuario creado, pero no se pudo activar el plan.')
          });
        },
        error: (err) => alert('❌ Error al crear el usuario root de la empresa.')
      });
    }
  }
}