import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isSavingPassword = false;
  userName = 'User';
  userRole = 'client';
  avatarUrl: string | null = null;
  userPreferences: any = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          const user = response.data;
          this.userPreferences = user.preferences || {};
          this.avatarUrl = this.userPreferences.avatarBase64 || null;

          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          
          this.userName = fullName || 'User';
          this.userRole = user.role || 'client';
          this.profileForm.patchValue({
            fullName: fullName,
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          });
        }
      },
      error: (err) => {
        console.error('Error fetching user profile', err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('File is too large. Maximum size is 2MB.', 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.avatarUrl = base64String;
        
        // Save immediately to preferences
        this.userPreferences.avatarBase64 = base64String;
        this.authService.updateSettings(this.userPreferences).subscribe({
          next: () => {
            this.snackBar.open('Profile picture updated!', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to save profile picture.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture() {
    this.avatarUrl = null;
    delete this.userPreferences.avatarBase64;
    
    this.authService.updateSettings(this.userPreferences).subscribe({
      next: () => {
        this.snackBar.open('Profile picture removed.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to remove profile picture.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formValue = this.profileForm.getRawValue();
      
      const [first_name, ...lastNameParts] = formValue.fullName.split(' ');
      const last_name = lastNameParts.join(' ') || '';
      
      const payload = {
        first_name: first_name,
        last_name: last_name,
        phone: formValue.phone,
        address: formValue.address
      };

      this.authService.updateProfile(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Failed to update profile.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
          console.error(err);
        }
      });
    }
  }

  savePassword() {
    if (this.passwordForm.valid) {
      this.isSavingPassword = true;
      const payload = {
        current_password: this.passwordForm.value.currentPassword,
        new_password: this.passwordForm.value.newPassword
      };
      
      this.authService.changePassword(payload).subscribe({
        next: (res) => {
          this.isSavingPassword = false;
          this.passwordForm.reset();
          this.snackBar.open('Password changed successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.isSavingPassword = false;
          const msg = err.error?.detail || 'Failed to change password. Ensure your current password is correct.';
          this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          console.error(err);
        }
      });
    }
  }
}
