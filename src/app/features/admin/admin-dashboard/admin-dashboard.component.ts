import { Component, inject, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { CaseService } from '../../../core/services/case/case.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdvocateService } from '../../../core/services/advocate/advocate.service';

import { AuditLogService, AuditLog } from '../../../core/services/audit-log/audit-log.service';
import { AdminService } from '../../../core/services/admin/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatTabsModule,
    MatDialogModule,
    MatListModule,
    MatSidenavModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {
  private caseService = inject(CaseService);
  private advocateService = inject(AdvocateService);
  public authService = inject(AuthService);
  private auditLogService = inject(AuditLogService);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  cases: any[] = [];
  advocates: any[] = [];
  advocateProfiles: any[] = [];
  auditLogs: AuditLog[] = [];
  clients: any[] = [];
  payments: any[] = [];
  isLoading = true;
  isAssigning = false;
  
  selectedAdvocate: any = null;
  selectedView: string = 'cases';

  displayedColumns: string[] = ['case_id', 'title', 'status', 'created_at', 'assignment', 'actions'];
  advocateColumns: string[] = ['name', 'bar_council_id', 'state', 'verification_status', 'actions'];
  auditColumns: string[] = ['date', 'user_email', 'action', 'resource', 'details'];
  clientColumns: string[] = ['name', 'email', 'case_count', 'joined_at', 'actions'];
  paymentColumns: string[] = ['date', 'client', 'case', 'amount', 'status', 'transaction_id'];

  ngOnInit(): void {
    this.loadData();
  }

  viewAdvocateDetails(advocate: any, template: TemplateRef<any>) {
    this.selectedAdvocate = advocate;
    this.dialog.open(template, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  loadData() {
    this.isLoading = true;
    
    // Load Advocates for case assignment drop downs
    this.caseService.getAdvocatesAdmin().subscribe({
      next: (res) => {
        this.advocates = res.data;
        // Then Load Cases
        this.caseService.getAllCasesAdmin().subscribe({
          next: (caseRes) => {
            this.cases = caseRes.data;
            // Then load Advocate Profiles
            this.advocateService.getAllAdvocatesAdmin().subscribe({
              next: (advRes) => {
                 this.advocateProfiles = advRes.data;
                 // Then load Audit Logs
                 this.auditLogService.getLogs().subscribe({
                   next: (logRes: any) => {
                     this.auditLogs = logRes.data;
                     // Then load Clients
                     this.adminService.getClients().subscribe({
                       next: (clientRes) => {
                         this.clients = clientRes.data;
                         // Then load Payments
                         this.adminService.getPayments().subscribe({
                           next: (paymentRes) => {
                             this.payments = paymentRes.data;
                             this.isLoading = false;
                           },
                           error: () => this.isLoading = false
                         });
                       },
                       error: () => this.isLoading = false
                     });
                   },
                   error: () => this.isLoading = false
                 });
              },
              error: () => this.isLoading = false
            });
          },
          error: (err) => {
            console.error('Failed to load cases', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load advocates', err);
        this.isLoading = false;
      }
    });
  }

  assignCase(caseId: string, advocateId: string) {
    if (!advocateId) return;
    
    this.isAssigning = true;
    this.caseService.assignCaseAdmin(caseId, advocateId).subscribe({
      next: () => {
        this.snackBar.open('Case assigned successfully!', 'Close', { duration: 3000 });
        // Update local state without full reload
        const index = this.cases.findIndex(c => c.id === caseId);
        if (index !== -1) {
          this.cases[index].advocate_id = advocateId;
        }
        this.isAssigning = false;
      },
      error: (err) => {
        console.error('Assignment failed', err);
        this.snackBar.open('Failed to assign case', 'Close', { duration: 3000 });
        this.isAssigning = false;
      }
    });
  }

  verifyAdvocate(userId: string, status: string) {
     this.advocateService.verifyAdvocate(userId, status).subscribe({
        next: () => {
           this.snackBar.open(`Advocate marked as ${status}`, 'Close', { duration: 3000 });
           // Update local array
           const index = this.advocateProfiles.findIndex(a => a.user_id === userId);
           if (index !== -1) {
              this.advocateProfiles[index].verification_status = status;
           }
        },
        error: () => {
           this.snackBar.open('Failed to update advocate status', 'Close', { duration: 3000 });
        }
     });
  }
}
