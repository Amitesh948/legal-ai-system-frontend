import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PaymentService } from '../../../core/services/payment/payment.service';

export interface PaymentRecord {
  id: string;
  case_id: string;
  case_number: string;
  amount: number;
  status: string;
  razorpay_order_id: string;
  created_at: string;
}

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  private paymentService = inject(PaymentService);

  displayedColumns: string[] = ['date', 'case_number', 'amount', 'status', 'order_id', 'actions'];
  dataSource = new MatTableDataSource<PaymentRecord>([]);
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.paymentService.getMyPayments().subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.dataSource.data = res.data;
          // Defer assignment to avoid early binding issues
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load payment history', err);
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
