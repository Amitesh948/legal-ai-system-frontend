import { Component, inject, OnInit } from '@angular/core';
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

import { AuthService } from '../../../core/services/auth/auth.service';
import { AdvocateService } from '../../../core/services/advocate/advocate.service';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private advocateService = inject(AdvocateService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    // Check if user was redirected here due to suspension
    import('@angular/router').then(m => {
      const url = new URL(window.location.href);
      if (url.searchParams.get('suspended') === 'true') {
        this.errorMessage = 'Your account has been suspended by an administrator. Please contact support.';
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // Decode JWT to find user role
        try {
          const token = res.data.access_token;
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          if (payload.role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (payload.role === 'advocate') {
            // Check if advocate has completed onboarding
            this.checkAdvocateOnboarding(token);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } catch (e) {
          // Fallback if decode fails
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }

  checkAdvocateOnboarding(token: string) {
    // Token is already stored by authService.login(), so the interceptor will attach it
    this.advocateService.getProfile().subscribe({
      next: (res: any) => {
        const status = res.data?.verification_status;
        if (status === 'approved') {
          this.router.navigate(['/dashboard']);
        } else {
          // pending, under_review, or rejected → send to onboarding
          this.router.navigate(['/advocate/onboarding']);
        }
      },
      error: () => {
        // If profile fetch fails, still send to onboarding
        this.router.navigate(['/advocate/onboarding']);
      }
    });
  }
}
