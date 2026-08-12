import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Report {
  id: string;
  case_id: string;
  case_number: string;
  file_name: string;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/reports';
  // since `prefix="/reports"` in the router and it is included directly in `api_v1_router`.

  getMyReports(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  downloadReport(caseId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/cases/${caseId}/report/download`, {
      responseType: 'blob'
    });
  }
}
