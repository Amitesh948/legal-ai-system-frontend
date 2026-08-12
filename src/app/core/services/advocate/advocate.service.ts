import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdvocateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/advocates`;

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateProfessionalDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/professional`, data);
  }

  updateEducationDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/education`, data);
  }

  updateBarCouncilDetails(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/bar-council`, data);
  }

  submitForVerification(): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/submit`, {});
  }

  // --- Admin Endpoints ---
  
  getAllAdvocatesAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all`);
  }

  verifyAdvocate(userId: string, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${userId}/verify`, { verification_status: status });
  }
}
