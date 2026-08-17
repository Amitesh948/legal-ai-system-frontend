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

  // --- CMS Admin Methods ---
  getCmsSettings(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/settings`);
  }
  
  updateCmsSettings(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cms/settings`, data);
  }

  getCmsFaqs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cms/faqs`);
  }

  createCmsFaq(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cms/faqs`, data);
  }

  updateCmsFaq(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cms/faqs/${id}`, data);
  }

  deleteCmsFaq(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cms/faqs/${id}`);
  }

  getCmsPages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cms/pages`);
  }

  createCmsPage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cms/pages`, data);
  }

  updateCmsPage(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cms/pages/${id}`, data);
  }

  getCmsPageDetail(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cms/pages/${id}`);
  }
}
