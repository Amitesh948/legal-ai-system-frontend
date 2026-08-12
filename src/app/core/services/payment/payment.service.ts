import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PaymentCreate {
  case_id: string;
  amount: number;
  currency?: string;
}

export interface PaymentVerify {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/payments';

  createOrder(data: PaymentCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/order`, data);
  }

  verifyPayment(data: PaymentVerify): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, data);
  }

  getCasePayments(caseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/case/${caseId}`);
  }

  getMyPayments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-payments`);
  }
}
