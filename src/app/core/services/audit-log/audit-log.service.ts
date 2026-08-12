import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address?: string;
  new_values?: any;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/dashboard/audit-logs';

  getLogs(skip: number = 0, limit: number = 50): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
      
    return this.http.get(this.apiUrl, { params });
  }
}
