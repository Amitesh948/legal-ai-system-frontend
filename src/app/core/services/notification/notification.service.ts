import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Real-time state
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Fetch notifications and update state */
  loadNotifications(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => {
        if (response.status === 'success') {
          this.notificationsSubject.next(response.data);
          // Recalculate unread count
          const unread = response.data.filter((n: AppNotification) => !n.is_read).length;
          this.unreadCountSubject.next(unread);
        }
      })
    );
  }

  /** Quick fetch just for the unread badge count */
  loadUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unread-count`).pipe(
      tap(response => {
        if (response.status === 'success') {
          this.unreadCountSubject.next(response.data.unread_count);
        }
      })
    );
  }

  /** Mark a single notification as read */
  markAsRead(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Optimistic UI update
        const current = this.notificationsSubject.value;
        const updated = current.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        );
        this.notificationsSubject.next(updated);
        
        const count = this.unreadCountSubject.value;
        if (count > 0) this.unreadCountSubject.next(count - 1);
      })
    );
  }

  /** Mark all as read */
  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        // Optimistic UI update
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ({ ...n, is_read: true }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      })
    );
  }
}
