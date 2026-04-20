import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Contenedor principal -->
      <div class="flex-1 ml-64 flex flex-col">
        <!-- Header -->
        <app-header></app-header>

        <!-- Contenido principal -->
        <main class="flex-1 overflow-auto pt-20 pb-8 px-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {}
