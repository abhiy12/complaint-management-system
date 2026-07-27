import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { VendorService } from '../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './vendor-form.component.html',
  styleUrl: './vendor-form.component.scss'
})
export class VendorFormComponent {
  readonly submitting = signal(false);
  // Shown once after a successful create, since the temp password can't be
  // retrieved again after this point (it's stored only as a bcrypt hash).
  readonly createdCredentials = signal<{ email: string; tempPassword: string | null } | null>(null);
form: FormGroup;
  

  constructor(private fb: FormBuilder, private vendorService: VendorService, private router: Router) {
   this.form = this.fb.group({
    vendorName: ['', Validators.required],
    companyName: [''],
    gstNumber: [''],
    address: [''],
    city: [''],
    state: [''],
    pinCode: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    contactPerson: [''],
    defaultUserEmail: ['', Validators.email],
    defaultUserPassword: ['', Validators.minLength(8)]
  });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);

    // Strip empty optional override fields so the backend applies its own defaults
    const raw = this.form.getRawValue();
    const payload: any = { ...raw };
    if (!payload.defaultUserEmail) delete payload.defaultUserEmail;
    if (!payload.defaultUserPassword) delete payload.defaultUserPassword;

    this.vendorService.create(payload).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        // Backend now returns { vendor, defaultUser }; show the credentials once.
        this.createdCredentials.set(res.data.defaultUser);
      },
      error: () => this.submitting.set(false)
    });
  }

  done(): void {
    this.router.navigate(['/admin/vendors']);
  }
}
