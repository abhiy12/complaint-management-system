import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="page">
      <mat-card class="card">
        <h2>Reset Password</h2>
        @if (done()) {
          <p>Your password has been reset. <a routerLink="/auth/login">Sign in</a></p>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword" />
            </mat-form-field>
            <button mat-flat-button color="primary" class="full-width" type="submit">Reset Password</button>
          </form>
        }
      </mat-card>
    </div>
  `,
  styles: [`.page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f6fa}
    .card{width:380px;padding:24px}.full-width{width:100%}`]
})
export class ResetPasswordComponent {
  readonly done = signal(false);
  private token = '';
  form: FormGroup;
  
  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute, private router: Router) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.form = this.fb.group({ newPassword: ['', [Validators.required, Validators.minLength(8)]] });

  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    this.auth.resetPassword(this.token, this.form.value.newPassword!).subscribe(() => this.done.set(true));
  }
}
