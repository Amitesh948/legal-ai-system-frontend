import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService, AppNotification } from '../../services/notification/notification.service';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatMenuModule, 
    MatButtonModule, 
    MatIconModule, 
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit {
  notifications$: Observable<AppNotification[]>;
  unreadCount$: Observable<number>;
  isLoading = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit() {
    // Initial fetch of the badge count
    this.notificationService.loadUnreadCount().subscribe();
    
    // Auto-fetch notifications to trigger popups for unread broadcasts when logging in
    this.notificationService.loadNotifications().subscribe({
      next: (res) => {
        // Find unread system broadcasts that were missed
        const currentNotifications = res?.data || [];
        const unreadBroadcasts = currentNotifications.filter((n: AppNotification) => !n.is_read && n.type === 'system_broadcast');
        
        if (unreadBroadcasts.length > 0) {
          // Show the most recent one as a popup
          const latest = unreadBroadcasts[0];
          this.snackBar.open(`📢 Missed Broadcast: ${latest.title} - ${latest.message}`, 'Mark Read', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['broadcast-snackbar', 'info-snackbar']
          }).onAction().subscribe(() => {
            this.notificationService.markAsRead(latest.id).subscribe();
          });
        }
      }
    });
  }

  onMenuOpened() {
    this.isLoading = true;
    this.notificationService.loadNotifications().subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
  }

  handleNotificationClick(notification: AppNotification) {
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  markAllAsRead(event: Event) {
    event.stopPropagation(); // keep menu open
    this.notificationService.markAllAsRead().subscribe();
  }
  
  getIconForType(type: string): string {
    switch(type) {
      case 'payment': return 'payments';
      case 'case_status': return 'gavel';
      case 'report': return 'picture_as_pdf';
      default: return 'notifications';
    }
  }
}
