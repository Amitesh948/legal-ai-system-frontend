import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdvocateService } from '../../../core/services/advocate/advocate.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private advocateService = inject(AdvocateService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  isLinear = true;
  isLoading = true;
  verificationStatus = 'pending';

  professionalForm!: FormGroup;
  educationForm!: FormGroup;
  barCouncilForm!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadProfile();
  }

  initForms() {
    this.professionalForm = this.fb.group({
      state: ['', Validators.required],
      district: ['', Validators.required],
      bar_association: ['', Validators.required],
      practice_areas: ['', Validators.required]
    });

    this.educationForm = this.fb.group({
      llb_degree: ['', Validators.required],
      university: ['', Validators.required],
      college: ['', Validators.required],
      graduation_year: ['', [Validators.required, Validators.min(1950), Validators.max(new Date().getFullYear())]]
    });

    this.barCouncilForm = this.fb.group({
      state_bar_council: ['', Validators.required],
      bar_council_id: ['', Validators.required],
      enrollment_date: ['', Validators.required]
    });
  }

  loadProfile() {
    this.advocateService.getProfile().subscribe({
      next: (res: any) => {
        const profile = res.data;
        this.verificationStatus = profile.verification_status;
        
        if (profile.state) {
          this.professionalForm.patchValue(profile);
          this.educationForm.patchValue(profile);
          this.barCouncilForm.patchValue(profile);
        }
        
        this.isLoading = false;
        
        if (this.verificationStatus === 'approved') {
          // Only redirect if fully approved
          this.router.navigate(['/dashboard']);
        }
        // For 'under_review' or 'pending', stay on this page
      },
      error: (err: any) => {
        console.error('Error loading profile', err);
        this.isLoading = false;
      }
    });
  }

  saveProfessional(stepper: any) {
    if (this.professionalForm.invalid) return;
    this.advocateService.updateProfessionalDetails(this.professionalForm.value).subscribe({
      next: () => stepper.next(),
      error: (err: any) => this.snackBar.open('Error saving professional details', 'Close', { duration: 3000 })
    });
  }

  saveEducation(stepper: any) {
    if (this.educationForm.invalid) return;
    this.advocateService.updateEducationDetails(this.educationForm.value).subscribe({
      next: () => stepper.next(),
      error: (err: any) => this.snackBar.open('Error saving education details', 'Close', { duration: 3000 })
    });
  }

  saveBarCouncil(stepper: any) {
    if (this.barCouncilForm.invalid) return;
    this.advocateService.updateBarCouncilDetails(this.barCouncilForm.value).subscribe({
      next: () => stepper.next(),
      error: (err: any) => this.snackBar.open('Error saving bar council details', 'Close', { duration: 3000 })
    });
  }

  submitVerification() {
    this.advocateService.submitForVerification().subscribe({
      next: () => {
        this.verificationStatus = 'under_review';
        this.snackBar.open('Profile submitted successfully! Please wait for admin approval.', 'Close', { duration: 5000 });
        // Stay on this page - show the "under review" message
      },
      error: (err: any) => this.snackBar.open('Error submitting verification', 'Close', { duration: 3000 })
    });
  }
}
