import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Flow State
  currentStep: 1 | 2 | 3 = 1;
  isLoading = false;
  errorMessage = '';
  verificationToken = '';
  verifiedEmail = '';

  // Step 1 Form
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // Step 2 Form
  otpForm = this.fb.group({
    otp_code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  // Step 3 Form
  detailsForm = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    ]],
    role: ['client', [Validators.required]] // Default to client
  });

  hidePassword = true;

  sendOtp() {
    if (this.emailForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const email = this.emailForm.value.email!;

    this.authService.sendOtp({ email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.verifiedEmail = email;
        this.currentStep = 2; // Move to OTP step
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const otp_code = this.otpForm.value.otp_code!;

    this.authService.verifyOtp({ email: this.verifiedEmail, otp_code }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.data?.verification_token) {
           this.verificationToken = res.data.verification_token;
           this.currentStep = 3; // Move to Details step
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid OTP.';
      }
    });
  }

  register() {
    if (this.detailsForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      ...this.detailsForm.value,
      email: this.verifiedEmail,
      verification_token: this.verificationToken
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']); // Success
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 422 && err.error?.detail && Array.isArray(err.error.detail)) {
          // Extract FastAPI validation error
          const firstError = err.error.detail[0];
          this.errorMessage = `${firstError.loc[firstError.loc.length - 1]}: ${firstError.msg}`;
        } else {
          this.errorMessage = err.error?.message || 'Registration failed.';
        }
      }
    });
  }
}
