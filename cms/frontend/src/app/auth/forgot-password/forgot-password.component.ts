import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="page">
      <mat-card class="card">
        <h2>Forgot Password</h2>
        @if (sent()) {
          <p>If that email exists in our system, a reset link has been sent.</p>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <button mat-flat-button color="primary" class="full-width" type="submit">Send Reset Link</button>
          </form>
        }
        <a routerLink="/auth/login">Back to login</a>
      </mat-card>
    </div>
  `,
  styles: [`.page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f6fa}
    .card{width:380px;padding:24px}.full-width{width:100%}`]
})
export class ForgotPasswordComponent {
  readonly sent = signal(false);
  form: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
      this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  }

  submit(): void {
    if (this.form.invalid) return;
    this.auth.forgotPassword(this.form.value.email!).subscribe(() => this.sent.set(true));
  }
}
