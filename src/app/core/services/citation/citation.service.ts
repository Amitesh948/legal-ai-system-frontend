import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Citation } from '../../models/citation.model';

export interface CitationResponse {
  success: boolean;
  message: string;
  data: Citation;
}

export interface CitationsResponse {
  success: boolean;
  message: string;
  data: Citation[];
}

@Injectable({
  providedIn: 'root'
})
export class CitationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/citations`;

  searchCitations(query: string = '', category: string = '', skip: number = 0, limit: number = 50): Observable<CitationsResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
      
    if (query) {
      params = params.set('q', query);
    }
    if (category) {
      params = params.set('category', category);
    }
    
    return this.http.get<CitationsResponse>(`${this.apiUrl}/search`, { params });
  }

  getCitation(id: string): Observable<CitationResponse> {
    return this.http.get<CitationResponse>(`${this.apiUrl}/${id}`);
  }

  createCitation(data: Partial<Citation>): Observable<CitationResponse> {
    return this.http.post<CitationResponse>(this.apiUrl, data);
  }

  updateCitation(id: string, data: Partial<Citation>): Observable<CitationResponse> {
    return this.http.put<CitationResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteCitation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
