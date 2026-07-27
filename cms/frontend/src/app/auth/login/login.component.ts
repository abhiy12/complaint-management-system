import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { AppIdentityService } from '../../core/services/app-identity.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCheckboxModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private appIdentity: AppIdentityService,
    private router: Router
  ) {
    this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password, rememberMe } = this.form.getRawValue();
    this.auth.login(email!, password!, !!rememberMe).subscribe({
      next: async (res) => {
        const role = res.data.user.role;

        const allowed = await this.appIdentity.isRoleAllowed(role);
        if (!allowed) {
          this.loading.set(false);
          this.auth.logout();
          this.errorMessage.set('This account\'s role can\'t log into this app. Please use the correct CMS app for your role.');
          return;
        }

        this.loading.set(false);
        const redirectMap: Record<string, string> = {
          super_admin: '/admin/dashboard',
          vendor_admin: '/vendor/dashboard',
          vendor_sub_user: '/vendor/dashboard',
          executive: '/executive/dashboard'
        };
        this.router.navigate([redirectMap[role] ?? '/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Login failed. Please try again.');
      }
    });
  }
}
