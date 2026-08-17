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
  
  enrollmentCertFile: File | null = null;
  panDocumentFile: File | null = null;
  govIdFile: File | null = null;
  degreeCertFile: File | null = null;
  copFile: File | null = null;
  isUploading = false;

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
          this.router.navigate(['/dashboard']);
        }
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
  
  onFileSelected(event: any, docType: string) {
    const file = event.target.files[0];
    if (file) {
      if (docType === 'enrollment') this.enrollmentCertFile = file;
      if (docType === 'pan') this.panDocumentFile = file;
      if (docType === 'govid') this.govIdFile = file;
      if (docType === 'degree') this.degreeCertFile = file;
      if (docType === 'cop') this.copFile = file;
    }
  }

  saveDocuments(stepper: any) {
    const formData = new FormData();
    if (this.enrollmentCertFile) formData.append('enrollment_certificate', this.enrollmentCertFile);
    if (this.panDocumentFile) formData.append('pan_document', this.panDocumentFile);
    if (this.govIdFile) formData.append('gov_id', this.govIdFile);
    if (this.degreeCertFile) formData.append('degree_certificate', this.degreeCertFile);
    if (this.copFile) formData.append('certificate_of_practice', this.copFile);
    
    // Require at least Enrollment, ID, and Degree
    if (!this.enrollmentCertFile || (!this.panDocumentFile && !this.govIdFile) || !this.degreeCertFile) {
      this.snackBar.open('Please upload all required documents (Enrollment, ID, Degree)', 'Close', { duration: 4000 });
      return;
    }

    this.isUploading = true;
    this.advocateService.uploadDocuments(formData).subscribe({
      next: () => {
        this.isUploading = false;
        stepper.next();
      },
      error: (err: any) => {
        this.isUploading = false;
        this.snackBar.open('Error uploading documents', 'Close', { duration: 3000 });
      }
    });
  }

  submitVerification() {
    this.advocateService.submitForVerification().subscribe({
      next: () => {
        this.verificationStatus = 'under_review';
        this.snackBar.open('Profile submitted successfully! Please wait for admin approval.', 'Close', { duration: 5000 });
      },
      error: (err: any) => this.snackBar.open('Error submitting verification', 'Close', { duration: 3000 })
    });
  }
}
