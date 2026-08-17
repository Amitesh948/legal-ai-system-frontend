import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminStats {
  totalClients: number;
  totalAdvocates: number;
  totalActiveCases: number;
  totalRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin';

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getRecentActivity(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity`);
  }

  getClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`);
  }

  getPayments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments`);
  }

  sendBroadcast(message: string, type: string = 'info', title: string = 'System Announcement'): Observable<any> {
    return this.http.post(`${this.apiUrl}/broadcast`, { message, type, title });
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/status`, { is_active: isActive });
  }
}
