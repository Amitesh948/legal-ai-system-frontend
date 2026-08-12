import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CitationService } from '../../../core/services/citation/citation.service';
import { Citation } from '../../../core/models/citation.model';

@Component({
  selector: 'app-citations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './citations.component.html',
  styleUrls: ['./citations.component.css']
})
export class CitationsComponent implements OnInit {
  private citationService = inject(CitationService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  citations: Citation[] = [];
  isLoading = false;
  
  // Search parameters
  searchQuery = '';
  categoryFilter = '';
  skip = 0;
  limit = 20;

  // Add/Edit Citation
  showAddForm = false;
  isSaving = false;
  editingId: string | null = null;
  citationForm: FormGroup;

  displayedColumns = ['title', 'type', 'court_name', 'judgment_date', 'actions'];

  categories = [
    'Constitutional Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 
    'Family Law', 'Property Law', 'Tax Law', 'Labor Law'
  ];

  citationTypes = [
    { value: 'judgment', label: 'Judgment' },
    { value: 'act', label: 'Act' },
    { value: 'section', label: 'Section' },
    { value: 'article', label: 'Article' }
  ];

  constructor() {
    this.citationForm = this.fb.group({
      title: ['', Validators.required],
      citation_type: ['judgment', Validators.required],
      act_name: [''],
      section_number: [''],
      court_name: [''],
      judgment_date: [''],
      case_reference: [''],
      category: [''],
      judgment_text: [''],
      notes: [''],
      keywords: [''] // Comma separated string internally, mapped to array on submit
    });
  }

  ngOnInit(): void {
    this.loadCitations();
  }

  loadCitations() {
    this.isLoading = true;
    this.citationService.searchCitations(this.searchQuery, this.categoryFilter, this.skip, this.limit)
      .subscribe({
        next: (res) => {
          this.citations = res.data;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.snackBar.open('Failed to load citations', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  onSearch() {
    this.skip = 0;
    this.loadCitations();
  }

  onPageChange(event: PageEvent) {
    this.skip = event.pageIndex * event.pageSize;
    this.limit = event.pageSize;
    this.loadCitations();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  editCitation(citation: Citation) {
    this.editingId = citation.id;
    this.showAddForm = true;
    
    // Map array to comma separated string for the form
    const keywordsStr = citation.keywords ? citation.keywords.join(', ') : '';
    
    this.citationForm.patchValue({
      title: citation.title,
      citation_type: citation.citation_type,
      act_name: citation.act_name,
      section_number: citation.section_number,
      court_name: citation.court_name,
      judgment_date: citation.judgment_date,
      case_reference: citation.case_reference,
      category: citation.category,
      judgment_text: citation.judgment_text,
      notes: citation.notes,
      keywords: keywordsStr
    });
  }

  deleteCitation(id: string) {
    if (confirm('Are you sure you want to delete this citation?')) {
      this.citationService.deleteCitation(id).subscribe({
        next: () => {
          this.snackBar.open('Citation deleted', 'Close', { duration: 3000 });
          this.loadCitations();
        },
        error: (err: any) => {
          console.error(err);
          this.snackBar.open('Failed to delete citation', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onSubmit() {
    if (this.citationForm.invalid) return;

    this.isSaving = true;
    const formValue = this.citationForm.value;
    
    // Convert keywords string to array
    const keywordsArray = formValue.keywords
      ? formValue.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
      : [];

    const payload: Partial<Citation> = {
      ...formValue,
      keywords: keywordsArray,
      // If date is empty, set to undefined/null
      judgment_date: formValue.judgment_date || null
    };

    if (this.editingId) {
      this.citationService.updateCitation(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Citation updated successfully', 'Close', { duration: 3000 });
          this.isSaving = false;
          this.toggleAddForm();
          this.loadCitations();
        },
        error: (err: any) => {
          console.error(err);
          this.snackBar.open('Failed to update citation', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
    } else {
      this.citationService.createCitation(payload).subscribe({
        next: () => {
          this.snackBar.open('Citation created successfully', 'Close', { duration: 3000 });
          this.isSaving = false;
          this.toggleAddForm();
          this.loadCitations();
        },
        error: (err: any) => {
          console.error(err);
          this.snackBar.open('Failed to create citation', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
    }
  }

  resetForm() {
    this.citationForm.reset({ citation_type: 'judgment' });
    this.editingId = null;
  }
}
