import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isLoading = false;
  userRole = 'client';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      darkMode: [true],
      twoFactorAuth: [false]
    });
  }

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.userRole = response.data.role || 'client';
          this.loadSettings(response.data.preferences || {});
        }
      },
      error: (err) => console.error('Error fetching user profile for settings', err)
    });
  }

  loadSettings(preferences: any) {
    if (Object.keys(preferences).length > 0) {
      this.settingsForm.patchValue(preferences);
    } else {
      // Default settings
      this.settingsForm.patchValue({
        emailNotifications: true,
        smsNotifications: false,
        darkMode: document.documentElement.classList.contains('dark'),
        twoFactorAuth: false
      });
    }
  }

  saveSettings() {
    this.isLoading = true;
    
    const settings = this.settingsForm.value;
    
    // Apply dark mode immediately to the HTML element
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save to the database
    this.authService.updateSettings(settings).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Settings saved to database successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to save settings to server.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
