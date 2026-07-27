import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ComplaintService } from '../../core/services/complaint.service';

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './complaint-form.component.html',
  styleUrl: './complaint-form.component.scss'
})
export class ComplaintFormComponent {
  readonly submitting = signal(false);
  readonly categories = ['Electrical', 'Networking', 'Hardware', 'Software', 'Printer', 'Internet', 'CCTV', 'Biometric', 'UPS', 'Air Conditioner', 'Other'];
  readonly priorities = ['low', 'medium', 'high', 'critical', 'emergency'];
form: FormGroup;

  constructor(private fb: FormBuilder, private complaintService: ComplaintService, private router: Router) {

  this.form = this.fb.group({
    category: ['', Validators.required],
    complaintType: [''],
    priority: ['medium', Validators.required],
    subject: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    address: [''],
    landmark: [''],
    expectedCompletionDate: ['']
  });

  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.complaintService.create(this.form.getRawValue() as any).subscribe({
      next: (res) => { this.submitting.set(false); this.router.navigate(['/admin/complaints', res.data.id]); },
      error: () => this.submitting.set(false)
    });
  }
}
