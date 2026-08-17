import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { }

  /** Get all cases for the current user */
  getMyCases(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cases/`);
  }

  /** Get a single case by ID */
  getCaseById(caseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cases/${caseId}`);
  }

  /** Create a new case */
  createCase(data: { title: string, description: string, priority: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/`, data);
  }

  /** Upload a document to a case */
  uploadDocument(caseId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/cases/${caseId}/documents`, formData);
  }

  /** Get legal opinion for a case */
  getOpinion(caseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cases/${caseId}/opinion`);
  }

  /** Save or update a legal opinion */
  saveOpinion(caseId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/${caseId}/opinion`, data);
  }

  /** Admin: Get all cases */
  getAllCasesAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cases/admin/all`);
  }

  /** Admin: Get all advocates */
  getAdvocatesAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cases/admin/advocates`);
  }

  /** Admin: Assign case to advocate */
  assignCaseAdmin(caseId: string, advocateUserId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/${caseId}/assign`, { advocate_user_id: advocateUserId });
  }

  /** Admin: Force override case status */
  overrideCaseStatusAdmin(caseId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/cases/${caseId}/status`, { status });
  }

  /** Admin: Delete/Archive a case */
  deleteCaseAdmin(caseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/cases/${caseId}`);
  }

  // Chat Messaging
  getCaseMessages(caseId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cases/${caseId}/messages`);
  }

  sendCaseMessage(caseId: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cases/${caseId}/messages`, { message_text: message });
  }

  // Document Q&A (RAG)
  askDocumentQuestion(caseId: string, question: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cases/${caseId}/document-chat`, { question });
  }
}
