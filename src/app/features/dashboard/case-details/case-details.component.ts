import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { CaseService } from '../../../core/services/case/case.service';
import { PaymentService } from '../../../core/services/payment/payment.service';
import { ChatWebSocketService } from '../../../core/services/chat/chat-websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { RatingDialogComponent } from './rating-dialog/rating-dialog.component';

declare var Razorpay: any;

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.css']
})
export class CaseDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private caseService = inject(CaseService);
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);

  caseId: string | null = null;
  caseData: any = null;
  isLoading = true;
  isGeneratingReport = false;
  errorMessage = '';
  userRole = '';
  
  // Chat properties
  messages: any[] = [];
  newMessage: string = '';
  isSendingMessage = false;
  
  // WebSocket properties
  private chatWsService = inject(ChatWebSocketService);
  private wsSubscription: any;
  isTyping = false;
  private typingTimeout: any;

  isUploadingDoc = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.caseId) {
      this.isUploadingDoc = true;
      this.caseService.uploadDocument(this.caseId, file).subscribe({
        next: (res) => {
          this.snackBar.open('Document uploaded successfully!', 'Close', { duration: 3000 });
          this.isUploadingDoc = false;
          this.loadCaseDetails(this.caseId!); // Refresh to show new doc
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to upload document', 'Close', { duration: 3000 });
          this.isUploadingDoc = false;
        }
      });
    }
    // Reset input
    event.target.value = '';
  }

  ngOnInit(): void {
    // Decode JWT to get user role
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = (payload.role || 'client').toLowerCase();
      }
    } catch (e) {
      this.userRole = '';
    }

    this.caseId = this.route.snapshot.paramMap.get('id');
    if (this.caseId) {
      this.loadCaseDetails(this.caseId);
      
      // Connect to WebSocket
      this.chatWsService.connect(this.caseId);
      this.wsSubscription = this.chatWsService.messages$.subscribe(event => {
        if (event.type === 'new_message' && event.data) {
          this.messages.push(event.data);
          // Scroll to bottom could be added here
        } else if (event.type === 'typing') {
          // Show typing indicator if sender is not me
          const myId = this.getMyUserId();
          if (event.sender_id && event.sender_id !== myId) {
            this.isTyping = true;
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
              this.isTyping = false;
            }, 3000);
          }
        }
      });
    } else {
      this.errorMessage = 'Invalid Case ID.';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.chatWsService.disconnect();
    clearTimeout(this.typingTimeout);
  }
  
  private getMyUserId(): string {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        return JSON.parse(atob(token.split('.')[1])).sub;
      }
    } catch (e) {}
    return '';
  }

  loadCaseDetails(id: string) {
    this.caseService.getCaseById(id).subscribe({
      next: (res) => {
        this.caseData = res.data;
        this.isLoading = false;
        this.loadMessages(id);
        
        // Fetch pending payment if in payment_pending status
        if (this.caseData.status === 'payment_pending') {
          this.paymentService.getCasePayments(id).subscribe({
            next: (pRes) => {
              const payments = pRes.data || [];
              this.pendingPayment = payments.find((p: any) => p.status === 'pending');
            },
            error: (err) => console.error('Failed to load case payments', err)
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load case details. It may have been deleted or you lack permission.';
        this.isLoading = false;
      }
    });
  }

  submitQuote() {
    if (!this.caseId || !this.quoteAmount) return;
    this.isSubmittingQuote = true;
    this.paymentService.createOrder({
      case_id: this.caseId,
      amount: this.quoteAmount,
      currency: 'INR'
    }).subscribe({
      next: () => {
        this.snackBar.open('Quote submitted successfully! Case is now awaiting client payment.', 'Close', { duration: 5000 });
        this.isSubmittingQuote = false;
        this.quoteAmount = null;
        this.loadCaseDetails(this.caseId!); // Refresh case
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Failed to submit quote.', 'Close', { duration: 5000 });
        this.isSubmittingQuote = false;
      }
    });
  }

  loadMessages(id: string) {
    this.caseService.getCaseMessages(id).subscribe({
      next: (res) => {
        this.messages = res.data;
      },
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  onTyping() {
    const myId = this.getMyUserId();
    if (myId) {
      this.chatWsService.sendTypingEvent(myId);
    }
  }

  // Document Q&A
  ragQuestion: string = '';
  ragChat: { sender: string, text: string }[] = [];
  isAskingRag: boolean = false;

  askRagQuestion() {
    if (!this.ragQuestion.trim() || !this.caseId) return;
    
    const question = this.ragQuestion;
    this.ragChat.push({ sender: 'user', text: question });
    this.ragQuestion = '';
    this.isAskingRag = true;
    
    this.caseService.askDocumentQuestion(this.caseId, question).subscribe({
      next: (res) => {
        this.ragChat.push({ sender: 'ai', text: res.data.answer });
        this.isAskingRag = false;
      },
      error: (err) => {
        console.error(err);
        this.ragChat.push({ sender: 'ai', text: "Sorry, I encountered an error while analyzing the document." });
        this.isAskingRag = false;
      }
    });
  }

  sendChatMessage() {
    if (!this.newMessage.trim() || !this.caseId) return;
    this.isSendingMessage = true;
    
    this.caseService.sendCaseMessage(this.caseId, this.newMessage).subscribe({
      next: () => {
        this.newMessage = '';
        this.isSendingMessage = false;
        // Instantly reload messages to show the one we just sent
        this.loadMessages(this.caseId!);
      },
      error: (err) => {
        console.error('Failed to send message', err);
        this.snackBar.open('Failed to send message', 'Close', { duration: 3000 });
        this.isSendingMessage = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  isPaying = false;
  pendingPayment: any = null;
  quoteAmount: number | null = null;
  isSubmittingQuote = false;

  shouldShowPaymentButton(): boolean {
    if (!this.caseData) return false;
    const status = this.caseData.status?.toLowerCase();
    const isPaymentState = status === 'payment_pending';
    const isClient = this.userRole === 'client' || !this.userRole; 
    
    // Only show to client if advocate has quoted (status is payment_pending)
    return isPaymentState && isClient && !!this.pendingPayment;
  }

  canSubmitQuote(): boolean {
    if (this.userRole !== 'advocate' || !this.caseData) return false;
    
    // Advocate can submit a quote if payment hasn't been requested or completed yet
    const status = this.caseData.status?.toLowerCase();
    
    // We allow quoting even if the AI or Advocate has started generating opinions/reports
    const invalidStatuses = ['payment_pending', 'payment_completed', 'completed', 'cancelled'];
    
    return !invalidStatuses.includes(status);
  }

  payForCase() {
    if (!this.caseId || !this.pendingPayment) return;
    this.isPaying = true;
    const currentCaseId = this.caseId;

    const orderId = this.pendingPayment.razorpay_order_id;
    
    // MOCK MODE: Bypass Razorpay popup if the backend didn't have valid keys
    if (orderId && orderId.startsWith('mock_order_')) {
      this.snackBar.open('Mock Mode: Simulating Razorpay Checkout...', 'Close', { duration: 3000 });
      setTimeout(() => {
        this.paymentService.verifyPayment({
          razorpay_order_id: orderId,
          razorpay_payment_id: 'mock_payment_id_' + Date.now(),
          razorpay_signature: 'mock_signature'
        }).subscribe({
          next: () => {
            this.snackBar.open('Mock Payment successful! Case is now active.', 'Close', { duration: 5000 });
            this.isPaying = false;
            this.loadCaseDetails(currentCaseId); // Refresh case
          },
          error: (err: any) => {
            console.error(err);
            this.snackBar.open('Payment verification failed.', 'Close', { duration: 5000 });
            this.isPaying = false;
          }
        });
      }, 1500);
      return;
    }

    const options = {
      key: environment.razorpayKeyId || 'rzp_test_1DP5mmOlF5G5ag', // Use actual key in prod
      amount: this.pendingPayment.amount * 100, // Amount in paise
      currency: this.pendingPayment.currency || 'INR',
      name: 'Legal AI System',
      description: 'Legal Consultation & Case Review',
      order_id: orderId,
      handler: (response: any) => {
        this.paymentService.verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        }).subscribe({
          next: () => {
            this.snackBar.open('Payment successful! Case is now active.', 'Close', { duration: 5000 });
            this.isPaying = false;
            this.loadCaseDetails(currentCaseId); // Refresh case
          },
          error: (err: any) => {
            console.error(err);
            this.snackBar.open('Payment verification failed.', 'Close', { duration: 5000 });
            this.isPaying = false;
          }
        });
      },
      prefill: {
        name: this.caseData?.client?.first_name || 'Client',
        email: this.caseData?.client?.email || ''
      },
      theme: {
        color: '#3f51b5'
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      console.error(response.error);
      this.snackBar.open('Payment failed or was cancelled.', 'Close', { duration: 3000 });
      this.isPaying = false;
    });
    rzp.open();
  }

  downloadDocument(docId: string) {
    const token = localStorage.getItem('access_token');
    const url = `${environment.apiUrl}/cases/${this.caseId}/documents/${docId}/download`;
    
    // Use fetch with auth header to download the file
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      // Find the doc name from caseData
      const doc = this.caseData?.documents?.find((d: any) => d.id === docId);
      a.download = doc?.file_name || 'document';
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(err => console.error('Download failed', err));
  }

  generateReport() {
    const currentCaseId = this.caseId;
    if (!currentCaseId) return;
    this.isGeneratingReport = true;
    
    const token = localStorage.getItem('access_token');
    fetch(`${environment.apiUrl}/cases/${currentCaseId}/report/generate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to generate report');
      return res.json();
    })
    .then(data => {
      this.snackBar.open('Report generated successfully!', 'Close', { duration: 3000 });
      this.caseData.status = 'report_generated';
      this.isGeneratingReport = false;
    })
    .catch(err => {
      console.error(err);
      this.snackBar.open('Failed to generate report', 'Close', { duration: 3000 });
      this.isGeneratingReport = false;
    });
  }

  downloadReport() {
    const currentCaseId = this.caseId;
    if (!currentCaseId) return;
    const token = localStorage.getItem('access_token');
    const url = `${environment.apiUrl}/cases/${currentCaseId}/report/download`;
    
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Report not found');
      return res.blob();
    })
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Legal_Report_${this.caseData?.case_number || currentCaseId}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(err => {
      console.error(err);
      this.snackBar.open('Failed to download report', 'Close', { duration: 3000 });
    });
  }

  private dialog = inject(MatDialog);

  openRatingDialog() {
    const dialogRef = this.dialog.open(RatingDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { caseData: this.caseData }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.caseId) {
        this.caseService.closeCase(this.caseId, result.rating, result.review).subscribe({
          next: () => {
            this.snackBar.open('Case marked as completed! Thank you for your feedback.', 'Close', { duration: 5000 });
            this.caseData.status = 'completed';
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Failed to close case', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
