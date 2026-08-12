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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReportService, Report } from '../../../core/services/report/report.service';

@Component({
  selector: 'app-reports-list',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.css']
})
export class ReportsListComponent implements OnInit {
  private reportService = inject(ReportService);

  displayedColumns: string[] = ['date', 'case_number', 'file_name', 'actions'];
  dataSource = new MatTableDataSource<Report>([]);
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getMyReports().subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.dataSource.data = res.data;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load reports', err);
        this.isLoading = false;
      }
    });
  }

  downloadReport(caseId: string, fileName: string) {
    this.reportService.downloadReport(caseId).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Download failed', err);
        // Could add a snackbar here
      }
    });
  }
}
