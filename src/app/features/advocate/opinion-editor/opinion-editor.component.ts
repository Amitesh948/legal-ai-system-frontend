import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { CaseService } from '../../../core/services/case/case.service';

@Component({
  selector: 'app-opinion-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './opinion-editor.component.html',
  styleUrls: ['./opinion-editor.component.css']
})
export class OpinionEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private caseService = inject(CaseService);
  private snackBar = inject(MatSnackBar);

  caseId: string | null = null;
  opinionForm!: FormGroup;
  isLoading = false;

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    if (this.caseId) {
      this.loadExistingOpinion(this.caseId);
    }
  }

  initForm() {
    this.opinionForm = this.fb.group({
      legal_opinion: ['', Validators.required],
      winning_probability: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      risk_assessment: ['', Validators.required],
      recommended_actions: ['', Validators.required],
      ai_summary_edited: [''],
      status: ['draft', Validators.required]
    });
  }

  loadExistingOpinion(id: string) {
    this.caseService.getOpinion(id).subscribe({
      next: (res) => {
        if (res.data) {
          this.opinionForm.patchValue({
            legal_opinion: res.data.legal_opinion || '',
            winning_probability: res.data.winning_probability || 50,
            risk_assessment: res.data.risk_assessment || '',
            recommended_actions: res.data.recommended_actions || '',
            ai_summary_edited: res.data.ai_summary_edited || '',
            status: res.data.status || 'draft'
          });
        }
      },
      error: (err) => console.error('Error loading opinion', err)
    });
  }

  saveOpinion(status: string = 'draft') {
    if (this.opinionForm.invalid || !this.caseId) return;

    this.isLoading = true;
    const payload = {
      ...this.opinionForm.value,
      status: status
    };

    this.caseService.saveOpinion(this.caseId, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Opinion ${status === 'finalized' ? 'Finalized' : 'Saved as Draft'}!`, 'Close', { duration: 3000 });
        if (status === 'finalized') {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error saving opinion', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
