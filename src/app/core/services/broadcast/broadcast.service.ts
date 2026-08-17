import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface BroadcastMessage {
  message: string;
  type: string;
  title: string;
}

export interface WebSocketEvent {
  type: 'global_broadcast';
  data: BroadcastMessage;
}

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  private socket: WebSocket | null = null;
  private wsUrl: string;

  constructor(private snackBar: MatSnackBar) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = new URL(environment.apiUrl);
    this.wsUrl = `${protocol}//${url.host}${url.pathname}/cases/ws/global`;
  }

  public connect(): void {
    if (this.socket) {
      return;
    }
    
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onmessage = (event) => {
      try {
        const payload: any = JSON.parse(event.data);
        if (payload.type === 'global_broadcast') {
          this.showBroadcast(payload.data);
        } else if (payload.type === 'force_logout') {
          // Check if the current user is the one being forced out
          import('../auth/auth.service').then(m => {
            const authService = document.createElement('app-root') ? (window as any).authServiceHack : null;
            // Since we can't easily inject AuthService here without circular deps in some setups,
            // we can just check local storage and redirect directly.
            const token = localStorage.getItem('access_token');
            if (token) {
              try {
                // Decode JWT to get user ID
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jwtPayload = JSON.parse(window.atob(base64));
                
                if (jwtPayload.sub === payload.user_id) {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  window.location.href = '/login?suspended=true';
                }
              } catch (e) {}
            }
          });
        }
      } catch (e) {
        console.error('Error parsing broadcast message', e);
      }
    };

    this.socket.onopen = () => {
      console.log('Global Broadcast WebSocket connected');
    };

    this.socket.onerror = (error) => {
      console.error('Global Broadcast WebSocket error', error);
    };

    this.socket.onclose = () => {
      console.log('Global Broadcast WebSocket disconnected. Reconnecting in 5s...');
      this.socket = null;
      setTimeout(() => this.connect(), 5000);
    };
  }

  private showBroadcast(broadcast: BroadcastMessage) {
    let panelClass = 'info-snackbar';
    if (broadcast.type === 'warning') panelClass = 'warning-snackbar';
    if (broadcast.type === 'success') panelClass = 'success-snackbar';
    
    // In Angular Material, we can't easily set a dynamic title in simple snackbar without a custom component, 
    // but we can combine title and message.
    const displayMessage = `📢 ${broadcast.title}: ${broadcast.message}`;
    
    this.snackBar.open(displayMessage, 'Got it!', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['broadcast-snackbar', panelClass] // We can add these classes to global styles
    });
  }
}
