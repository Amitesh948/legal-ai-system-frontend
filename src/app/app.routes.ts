import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth/auth.guard';

export const routes: Routes = [
  // Public Routes
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full' 
  },
  { 
    path: 'about', 
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  { 
    path: 'profiles', 
    loadComponent: () => import('./features/profiles/profiles.component').then(m => m.ProfilesComponent)
  },
  { 
    path: 'practice-areas', 
    loadComponent: () => import('./features/practice-areas/practice-areas.component').then(m => m.PracticeAreasComponent)
  },
  { 
    path: 'blog', 
    loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'auth/forgot-password', 
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) 
  },
  { 
    path: 'auth/reset-password', 
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) 
  },
  
  // Protected Routes
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'cases/:id',
    loadComponent: () => import('./features/dashboard/case-details/case-details.component').then(m => m.CaseDetailsComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'cases/:id/opinion',
    loadComponent: () => import('./features/advocate/opinion-editor/opinion-editor.component').then(m => m.OpinionEditorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'advocate/onboarding',
    loadComponent: () => import('./features/advocate/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'citations',
    loadComponent: () => import('./features/dashboard/citations/citations.component').then(m => m.CitationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payments',
    loadComponent: () => import('./features/dashboard/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/dashboard/reports-list/reports-list.component').then(m => m.ReportsListComponent),
    canActivate: [authGuard]
  },
  
  // Default Redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
