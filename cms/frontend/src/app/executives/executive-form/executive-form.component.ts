import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ExecutiveService } from '../../core/services/executive.service';

@Component({
  selector: 'app-executive-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './executive-form.component.html',
  styleUrl: './executive-form.component.scss'
})
export class ExecutiveFormComponent {
  readonly submitting = signal(false);
form: FormGroup;
  

  constructor(private fb: FormBuilder, private executiveService: ExecutiveService, private router: Router) {
    this.form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    employeeId: ['', Validators.required],
    zone: [''],
    department: [''],
    skills: [''],
    vehicleNumber: [''],
    experienceYears: [0]
  });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.executiveService.create(this.form.getRawValue() as any).subscribe({
      next: () => { this.submitting.set(false); this.router.navigate(['/admin/executives']); },
      error: () => this.submitting.set(false)
    });
  }
}
