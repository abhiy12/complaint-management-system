import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-vendor-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatMenuModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav mode="side" opened class="sidebar">
        <div class="brand">Vendor Portal</div>
        <mat-nav-list>
          <a mat-list-item routerLink="/vendor/dashboard" routerLinkActive="active"><mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span></a>
          <a mat-list-item routerLink="/vendor/complaints" routerLinkActive="active"><mat-icon matListItemIcon>report_problem</mat-icon><span matListItemTitle>Complaints</span></a>
          <a mat-list-item routerLink="/vendor/profile" routerLinkActive="active"><mat-icon matListItemIcon>person</mat-icon><span matListItemTitle>Profile</span></a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="topbar">
          <span class="spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>account_circle</mat-icon></button>
          <mat-menu #menu="matMenu"><button mat-menu-item (click)="auth.logout()">Logout</button></mat-menu>
        </mat-toolbar>
        <div class="content"><router-outlet></router-outlet></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`.shell{height:100vh}.sidebar{width:220px;background:var(--cms-sidebar-bg);color:#fff}
    .brand{padding:20px 16px;font-weight:700}::ng-deep .sidebar .mat-mdc-list-item{color:#cbd2e0}
    ::ng-deep .sidebar .mat-mdc-list-item.active{background:rgba(255,255,255,.08);color:#fff}
    .topbar{background:#fff}.spacer{flex:1}.content{padding:24px}`]
})
export class VendorLayoutComponent {
  constructor(public auth: AuthService) {}
}
