import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../../core/services/auth/auth.service';
import { CaseService } from '../../../core/services/case/case.service';
import { AdvocateService } from '../../../core/services/advocate/advocate.service';
import { AdminService } from '../../../core/services/admin/admin.service';
import { CreateCaseDialogComponent } from '../create-case-dialog/create-case-dialog.component';
import { NotificationDropdownComponent } from '../../../core/components/notification-dropdown/notification-dropdown.component';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NotificationDropdownComponent,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private caseService = inject(CaseService);
  private advocateService = inject(AdvocateService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  userName = 'My Profile';
  userRole = '';
  cases: any[] = [];
  isLoadingCases = true;
  
  // Dynamic stats
  activeCasesCount = 0;
  documentsAnalysedCount = 0;
  completedOpinionsCount = 0;
  
  // Admin stats
  adminStats: any = null;
  recentActivity: any[] = [];
  
  // Chart.js Data
  chartOptions = { responsive: true, maintainAspectRatio: false };
  caseStatusChartData: any = { labels: [], datasets: [{ data: [] }] };
  topAdvocatesChartData: any = { labels: [], datasets: [{ data: [] }] };
  hasChartData = false;

  ngOnInit() {
    this.authService.me().subscribe({
      next: (res) => {
        if (res.data?.first_name) {
          this.userName = `${res.data.first_name} ${res.data.last_name}`;
        }
      },
      error: (err) => console.error('Failed to load user profile', err)
    });

    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = payload.role;
        
        if (this.userRole === 'advocate') {
          this.advocateService.getProfile().subscribe({
            next: (res: any) => {
              if (res.data?.verification_status !== 'approved') {
                this.router.navigate(['/advocate/onboarding']);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('Failed to decode token', e);
    }

    if (this.userRole === 'admin') {
      this.loadAdminStats();
      this.loadAdminActivity();
      this.loadAdminAnalytics();
    } else {
      this.loadCases();
    }
  }

  loadAdminStats() {
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.adminStats = res.data;
        this.isLoadingCases = false; 
      },
      error: (err) => {
        console.error('Failed to load admin stats', err);
        this.isLoadingCases = false;
      }
    });
  }

  loadAdminAnalytics() {
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

  loadAdminActivity() {
    this.adminService.getRecentActivity().subscribe({
      next: (res) => {
        this.recentActivity = res.data;
      },
      error: (err) => console.error('Failed to load admin activity', err)
    });
  }

  openCreateCaseDialog() {
    const dialogRef = this.dialog.open(CreateCaseDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoadingCases = true;
        this.loadCases();
      }
    });
  }

  loadCases() {
    this.caseService.getMyCases().subscribe({
      next: (res) => {
        this.cases = res.data || [];
        this.isLoadingCases = false;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Failed to load cases', err);
        this.isLoadingCases = false;
      }
    });
  }

  calculateStats() {
    this.activeCasesCount = this.cases.filter(c => c.status !== 'completed').length;
    this.completedOpinionsCount = this.cases.filter(c => c.status === 'completed' || c.status === 'ready').length;
    
    // Calculate actual documents analysed based on the documents array returned by the API
    this.documentsAnalysedCount = this.cases.reduce((sum, currentCase) => {
      return sum + (currentCase.documents ? currentCase.documents.length : 0);
    }, 0);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
