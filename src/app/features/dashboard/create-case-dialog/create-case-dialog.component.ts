import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CaseService } from '../../../core/services/case/case.service';

@Component({
  selector: 'app-create-case-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-case-dialog.component.html',
  styleUrls: ['./create-case-dialog.component.css']
})
export class CreateCaseDialogComponent {
  private fb = inject(FormBuilder);
  private caseService = inject(CaseService);
  private dialogRef = inject(MatDialogRef<CreateCaseDialogComponent>);

  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;

  caseForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium', [Validators.required]]
  });

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.caseForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Please fill all required fields and select a file.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Step 1: Create Case
    const caseData = this.caseForm.value as any;
    this.caseService.createCase(caseData).subscribe({
      next: (res) => {
        const caseId = res.data.id;
        
        // Step 2: Upload Document
        this.caseService.uploadDocument(caseId, this.selectedFile!).subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true); // true indicates success
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Case created, but document upload failed.';
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Failed to create case.';
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}
