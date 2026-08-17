import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon [color]="data.isDestructive ? 'warn' : 'primary'" class="title-icon">
        {{ data.isDestructive ? 'warning' : 'info' }}
      </mat-icon>
      {{ data.title }}
    </h2>
    
    <mat-dialog-content class="dialog-content">
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()" class="cancel-btn">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button mat-flat-button 
              [color]="data.isDestructive ? 'warn' : 'primary'" 
              (click)="onConfirm()"
              class="confirm-btn">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 24px 24px 16px 24px;
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      border-bottom: 1px solid var(--color-border);
    }
    .title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .dialog-content {
      padding: 24px !important;
      font-size: 15px;
      color: var(--color-text-main);
      line-height: 1.5;
    }
    .dialog-actions {
      padding: 16px 24px;
      margin-bottom: 0;
      background-color: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }
    .cancel-btn {
      font-weight: 500;
    }
    .confirm-btn {
      font-weight: 600;
      letter-spacing: 0.3px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
