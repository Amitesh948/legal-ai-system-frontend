import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoggedIn = false;
  isAuthPage = false;
  
  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // Track if we are on an auth page (login/register)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.isAuthPage = url.includes('/login') || url.includes('/register');
      // Close any open dropdowns when navigating
      this.showNotifications = false;
      this.showProfileMenu = false;
    });
  }
  
  showNotifications = false;
  showProfileMenu = false;

  notifications = [
    { id: 1, title: 'Case Update', message: 'The hearing for Smith v. Jones has been rescheduled.', time: '10 mins ago', isRead: false },
    { id: 2, title: 'New Message', message: 'Attorney Davis sent you a message.', time: '1 hour ago', isRead: false },
    { id: 3, title: 'Document Signed', message: 'Client has signed the NDA agreement.', time: '2 hours ago', isRead: true }
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  markAsRead(notification: any, event: Event) {
    event.stopPropagation();
    notification.isRead = true;
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notifications.forEach(n => n.isRead = true);
  }

  logout() {
    this.authService.logout();
    this.showProfileMenu = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showNotifications = false;
    this.showProfileMenu = false;
  }
}
