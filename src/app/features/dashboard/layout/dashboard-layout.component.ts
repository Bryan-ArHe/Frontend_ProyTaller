import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="dashboard-container">
      @if (layoutService.isSidebarOpen()) {
        <div class="sidebar-overlay" (click)="layoutService.closeSidebar()"></div>
      }

      <app-sidebar></app-sidebar>

      <div class="main-wrapper" [class.sidebar-open]="layoutService.isSidebarOpen()">
        <app-header></app-header>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent {
  readonly layoutService = inject(LayoutService);
}
