import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';

  form = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(8)]]
  });

  hidePassword = true;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Invalid or missing password reset token.';
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.token) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.token, this.form.value.new_password!).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. The link might be expired.';
      }
    });
  }
}
