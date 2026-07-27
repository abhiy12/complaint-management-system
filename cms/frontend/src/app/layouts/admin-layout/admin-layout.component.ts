import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatToolbarModule,
    MatSidenavModule, MatListModule, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  readonly navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Vendors', icon: 'store', route: '/admin/vendors' },
    { label: 'Executives', icon: 'engineering', route: '/admin/executives' },
    { label: 'Complaints', icon: 'report_problem', route: '/admin/complaints' },
    { label: 'Reports', icon: 'bar_chart', route: '/admin/reports' },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' }
  ];

  constructor(public auth: AuthService) {}

  logout(): void { this.auth.logout(); }
}
