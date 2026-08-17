import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-rating-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #1e293b; display: flex; align-items: center; gap: 8px;">
      <mat-icon style="color: #f59e0b;">star</mat-icon> Rate Your Advocate
    </h2>
    <mat-dialog-content style="min-width: 400px; padding-top: 16px;">
      <p style="color: #64748b; margin-bottom: 24px;">How was your experience working with your advocate on this case?</p>
      
      <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
        <button mat-icon-button *ngFor="let star of stars; let i = index" 
                (click)="setRating(i + 1)" 
                (mouseenter)="hoverRating = i + 1" 
                (mouseleave)="hoverRating = 0"
                style="transform: scale(1.5);">
          <mat-icon [style.color]="(hoverRating || rating) > i ? '#f59e0b' : '#cbd5e1'">
            {{ (hoverRating || rating) > i ? 'star' : 'star_border' }}
          </mat-icon>
        </button>
      </div>

      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Leave a review (optional)</mat-label>
        <textarea matInput [(ngModel)]="review" rows="4" placeholder="Your advocate was incredibly helpful..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 16px;">
      <button mat-button (click)="onCancel()" style="color: #64748b;">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="rating === 0" (click)="onSubmit()">Submit & Close Case</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-mdc-dialog-content { padding-bottom: 0; }
  `]
})
export class RatingDialogComponent {
  stars = [1, 2, 3, 4, 5];
  rating = 0;
  hoverRating = 0;
  review = '';

  constructor(
    public dialogRef: MatDialogRef<RatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  setRating(val: number) {
    this.rating = val;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close({
      rating: this.rating,
      review: this.review
    });
  }
}
