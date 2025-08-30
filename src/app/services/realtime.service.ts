import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UnfallFormData } from '../accident-data/accident-data.module';

@Injectable()
export class RealtimeService {
  private socket?: WebSocket;
  private formUpdatesSubject = new Subject<Partial<UnfallFormData>>();

  formUpdates$: Observable<Partial<UnfallFormData>> = this.formUpdatesSubject.asObservable();

  constructor(private zone: NgZone) {}

  startSession(apiKey: string) {
    if (this.socket) {
      this.socket.close();
    }
    const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview';
    this.socket = new WebSocket(url, [
      'realtime',
      `openai-insecure-api-key.${apiKey}`,
      'openai-beta.realtime=v1',
    ]);
    this.socket.onmessage = (event) => this.handleMessage(event);
    this.socket.onerror = (err) => console.error('Realtime session error', err);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'form_update' && message.data) {
        this.zone.run(() => this.formUpdatesSubject.next(message.data));
      }
    } catch (error) {
      console.error('Failed to handle message', error);
    }
  }

  stopSession(): void {
    console.log('Realtime session stopped');
  }
}
