import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CmsPublicService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/public';

  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  getHome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/home`);
  }

  getPracticeAreas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/practice-areas`);
  }

  getFaqs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/faqs`);
  }

  getPage(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pages/${slug}`);
  }

  getAttorneys(): Observable<any> {
    return this.http.get(`${this.apiUrl}/attorneys`);
  }
}
