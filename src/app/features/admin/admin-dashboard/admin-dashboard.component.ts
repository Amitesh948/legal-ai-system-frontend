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
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CaseService } from '../../../core/services/case/case.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdvocateService } from '../../../core/services/advocate/advocate.service';
import { environment } from '../../../../environments/environment';

import { AuditLogService, AuditLog } from '../../../core/services/audit-log/audit-log.service';
import { AdminService } from '../../../core/services/admin/admin.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BaseChartDirective } from 'ng2-charts';

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
    MatSidenavModule,
    MatBadgeModule,
    MatMenuModule,
    MatInputModule,
    MatTooltipModule,
    BaseChartDirective
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
  
  // Dynamic Notifications
  unreadNotifications = 0;
  recentNotifications: any[] = [];

  // Chart.js Data
  chartOptions = { responsive: true, maintainAspectRatio: false };
  caseStatusChartData: any = { labels: [], datasets: [{ data: [] }] };
  topAdvocatesChartData: any = { labels: [], datasets: [{ data: [] }] };
  hasChartData = false;
  adminStats: any = null;

  // Filtering
  searchQuery = '';
  statusFilter = 'all';

  get filteredCases() {
    return this.cases.filter(c => {
      const matchesSearch = c.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            c.id?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || c.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  isLoading = true;
  isAssigning = false;
  
  selectedAdvocate: any = null;
  selectedView: string = 'analytics';
  
  // Chat Audit
  auditCaseTitle: string = '';
  auditMessages: any[] = [];
  isAuditLoading: boolean = false;

  displayedColumns: string[] = ['case_id', 'title', 'status', 'created_at', 'assignment', 'actions'];
  advocateColumns: string[] = ['name', 'bar_council_id', 'state', 'verification_status', 'actions'];
  auditColumns: string[] = ['date', 'user_email', 'action', 'resource', 'details'];
  clientColumns: string[] = ['name', 'email', 'case_count', 'joined_at', 'actions'];
  paymentColumns: string[] = ['date', 'client', 'case', 'amount', 'status', 'transaction_id'];

  ngOnInit(): void {
    this.loadData();
    this.loadAdminAnalytics();
  }

  viewChatAudit(caseObj: any, template: TemplateRef<any>) {
    this.auditCaseTitle = caseObj.title;
    this.isAuditLoading = true;
    this.auditMessages = [];
    
    this.dialog.open(template, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'chat-audit-dialog'
    });

    this.caseService.getCaseMessages(caseObj.id).subscribe({
      next: (res) => {
        this.auditMessages = res.data || [];
        this.isAuditLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load chat history', 'Close', { duration: 3000 });
        this.isAuditLoading = false;
      }
    });
  }

  loadAdminAnalytics() {
    this.adminService.getStats().subscribe(res => { this.adminStats = res.data; });
    this.caseService.getAdminAnalytics().subscribe({
      next: (res) => {
        const data = res.data;
        if (data.case_status) {
          this.caseStatusChartData = {
            labels: Object.keys(data.case_status).map(k => k.replace('_', ' ').toUpperCase()),
            datasets: [{
              data: Object.values(data.case_status),
              backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6']
            }]
          };
        }
        if (data.top_advocates && data.top_advocates.length > 0) {
          this.topAdvocatesChartData = {
            labels: data.top_advocates.map((a: any) => a.name),
            datasets: [{
              label: 'Average Rating',
              data: data.top_advocates.map((a: any) => a.rating),
              backgroundColor: '#3b82f6'
            }]
          };
        }
        this.hasChartData = true;
      },
      error: (err) => console.error(err)
    });
  }

  viewAdvocateDetails(advocate: any, template: TemplateRef<any>) {
    this.selectedAdvocate = advocate;
    this.dialog.open(template, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  clearNotifications() {
    this.unreadNotifications = 0;
  }

  toggleUserStatus(userId: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const action = newStatus ? 'reactivate' : 'suspend';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.adminService.updateUserStatus(userId, newStatus).subscribe({
        next: (res) => {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          this.loadData(); // Refresh the tables
        },
        error: (err) => {
          this.snackBar.open(err.error?.detail || 'Failed to update user status', 'Close', { duration: 3000 });
        }
      });
    }
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
                     
                     // Setup dynamic notifications from recent activity
                     if (this.auditLogs && this.auditLogs.length > 0) {
                        this.recentNotifications = this.auditLogs.slice(0, 5);
                        this.unreadNotifications = this.recentNotifications.length;
                     }

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

  availableStatuses = [
    'new',
    'payment_pending',
    'payment_completed',
    'payment_failed',
    'documents_uploaded',
    'ai_processing',
    'under_review',
    'opinion_generated',
    'report_generated',
    'completed',
    'cancelled'
  ];

  overrideCaseStatus(caseId: string, newStatus: string) {
    if (!caseId || !newStatus) return;
    
    this.caseService.overrideCaseStatusAdmin(caseId, newStatus).subscribe({
      next: () => {
        this.snackBar.open(`Case status forced to ${newStatus}`, 'Close', { duration: 3000 });
        const index = this.cases.findIndex(c => c.id === caseId);
        if (index !== -1) {
          this.cases[index].status = newStatus;
        }
      },
      error: () => {
        this.snackBar.open('Failed to override status.', 'Close', { duration: 3000 });
      }
    });
  }

  deleteCase(caseId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Case',
        message: 'Are you absolutely sure you want to permanently delete this case? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.caseService.deleteCaseAdmin(caseId).subscribe({
          next: () => {
            this.snackBar.open('Case deleted successfully', 'Close', { duration: 3000 });
            this.cases = this.cases.filter(c => c.id !== caseId);
          },
          error: (err) => {
            console.error('Failed to delete case', err);
            this.snackBar.open('Failed to delete case.', 'Close', { duration: 3000 });
          }
        });
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

  getDocumentUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Extract base URL from API URL (e.g., http://localhost:8000/api/v1 -> http://localhost:8000)
    const baseUrl = environment.apiUrl.split('/api/')[0];
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  exportToCSV(dataType: 'cases' | 'clients' | 'advocates' | 'payments') {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;

    switch(dataType) {
      case 'cases':
        data = this.cases.map(c => ({
          ID: c.id,
          Title: c.title,
          Status: c.status,
          Created_Date: new Date(c.created_at).toLocaleDateString(),
          Advocate_Assigned: c.advocate_id ? 'Yes' : 'No'
        }));
        headers = ['ID', 'Title', 'Status', 'Created_Date', 'Advocate_Assigned'];
        break;
      case 'clients':
        data = this.clients.map(c => ({
          Name: c.name,
          Email: c.email,
          Active_Cases: c.case_count,
          Joined_Date: new Date(c.joined_at).toLocaleDateString()
        }));
        headers = ['Name', 'Email', 'Active_Cases', 'Joined_Date'];
        break;
      case 'advocates':
        data = this.advocateProfiles.map(a => ({
          Name: `${a.first_name} ${a.last_name}`,
          Email: a.email,
          Bar_Council_ID: a.bar_council_id || 'N/A',
          Location: `${a.district || ''}, ${a.state || ''}`,
          Status: a.verification_status
        }));
        headers = ['Name', 'Email', 'Bar_Council_ID', 'Location', 'Status'];
        break;
      case 'payments':
        data = this.payments.map(p => ({
          Transaction_ID: p.transaction_id || p.order_id,
          Client_Name: p.client_name,
          Case_Title: p.case_title,
          Amount: p.amount,
          Currency: p.currency,
          Status: p.status,
          Date: new Date(p.date).toLocaleDateString()
        }));
        headers = ['Transaction_ID', 'Client_Name', 'Case_Title', 'Amount', 'Currency', 'Status', 'Date'];
        break;
    }

    if (data.length === 0) {
      this.snackBar.open(`No ${dataType} data available to export.`, 'Close', { duration: 3000 });
      return;
    }

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        // Escape quotes and wrap in quotes if contains comma
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.snackBar.open(`${dataType} data exported successfully!`, 'Close', { duration: 3000 });
  }

  broadcastTitle: string = 'System Announcement';
  broadcastMessage: string = '';
  broadcastType: string = 'info';
  isBroadcasting: boolean = false;

  openBroadcastDialog(template: TemplateRef<any>) {
    this.broadcastTitle = 'System Announcement';
    this.broadcastMessage = '';
    this.broadcastType = 'info';
    this.dialog.open(template, { width: '450px' });
  }

  sendGlobalBroadcast() {
    if (!this.broadcastMessage.trim()) return;
    
    this.isBroadcasting = true;
    this.adminService.sendBroadcast(this.broadcastMessage, this.broadcastType, this.broadcastTitle).subscribe({
      next: () => {
        this.snackBar.open('Global broadcast sent successfully!', 'Close', { duration: 3000 });
        this.isBroadcasting = false;
      },
      error: () => {
        this.snackBar.open('Failed to send broadcast.', 'Close', { duration: 3000 });
        this.isBroadcasting = false;
      }
    });
  }
}
