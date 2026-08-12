import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  id: string;
  case_id: string;
  sender_id: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_role: string;
}

export interface WebSocketEvent {
  type: 'new_message' | 'typing';
  data?: ChatMessage;
  sender_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketEvent>();
  
  public messages$: Observable<WebSocketEvent> = this.messageSubject.asObservable();
  private wsUrl: string;

  constructor() {
    // Determine WS protocol based on HTTP protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If environment.apiUrl has protocol, replace it
    const url = environment.apiUrl.replace(/^https?:\/\//, '');
    this.wsUrl = `${protocol}//${url}/api/v1/cases/ws/`;
  }

  public connect(caseId: string): void {
    if (this.socket) {
      this.socket.close();
    }
    
    this.socket = new WebSocket(this.wsUrl + caseId);

    this.socket.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch (e) {
        console.error('Error parsing websocket message', e);
      }
    };

    this.socket.onopen = () => {
      console.log(`WebSocket connected for case ${caseId}`);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  public sendTypingEvent(senderId: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        sender_id: senderId
      }));
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
