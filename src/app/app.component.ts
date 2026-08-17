import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  showHeaderFooter = true;
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      // Hide header/footer on internal application routes (dashboards, cases, onboarding)
      if (
        url.includes('/dashboard') || 
        url.includes('/cases') || 
        url.includes('/admin') || 
        url.includes('/advocate') || 
        (url.includes('/profile') && !url.includes('/profiles')) || 
        url.includes('/settings')
      ) {
        this.showHeaderFooter = false;
      } else {
        this.showHeaderFooter = true;
      }
    });

    // Apply global user settings on app load if logged in
    this.authService.me().subscribe({
      next: (response) => {
        if (response && response.data?.preferences) {
          const settings = response.data.preferences;
          if (settings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      error: () => {} // Not logged in or token expired
    });
  }
}
