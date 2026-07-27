import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },

  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) }
    ]
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['super_admin'])],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'vendors', loadComponent: () => import('./vendors/vendor-list/vendor-list.component').then(m => m.VendorListComponent) },
      { path: 'vendors/new', loadComponent: () => import('./vendors/vendor-form/vendor-form.component').then(m => m.VendorFormComponent) },
      { path: 'executives', loadComponent: () => import('./executives/executive-list/executive-list.component').then(m => m.ExecutiveListComponent) },
      { path: 'executives/new', loadComponent: () => import('./executives/executive-form/executive-form.component').then(m => m.ExecutiveFormComponent) },
      { path: 'executives/tracking', loadComponent: () => import('./executives/executive-tracking-map/executive-tracking-map.component').then(m => m.ExecutiveTrackingMapComponent) },
      { path: 'complaints', loadComponent: () => import('./complaints/complaint-list/complaint-list.component').then(m => m.ComplaintListComponent) },
      { path: 'complaints/new', loadComponent: () => import('./complaints/complaint-form/complaint-form.component').then(m => m.ComplaintFormComponent) },
      { path: 'complaints/:id', loadComponent: () => import('./complaints/complaint-details/complaint-details.component').then(m => m.ComplaintDetailsComponent) },
      { path: 'complaints/:id/assign', loadComponent: () => import('./complaints/assign-complaint/assign-complaint.component').then(m => m.AssignComplaintComponent) },
      { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'notifications', loadComponent: () => import('./notifications/notification-center/notification-center.component').then(m => m.NotificationCenterComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },

  {
    path: 'vendor',
    canActivate: [authGuard, roleGuard(['vendor_admin', 'vendor_sub_user'])],
    loadComponent: () => import('./layouts/vendor-layout/vendor-layout.component').then(m => m.VendorLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent) },
      { path: 'complaints', loadComponent: () => import('./complaints/complaint-list/complaint-list.component').then(m => m.ComplaintListComponent) },
      { path: 'complaints/new', loadComponent: () => import('./complaints/complaint-form/complaint-form.component').then(m => m.ComplaintFormComponent) },
      { path: 'complaints/:id', loadComponent: () => import('./complaints/complaint-details/complaint-details.component').then(m => m.ComplaintDetailsComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },

  {
    path: 'executive',
    canActivate: [authGuard, roleGuard(['executive'])],
    loadComponent: () => import('./layouts/executive-layout/executive-layout.component').then(m => m.ExecutiveLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/executive-dashboard/executive-dashboard.component').then(m => m.ExecutiveDashboardComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },

  { path: '**', redirectTo: 'auth/login' }
];
