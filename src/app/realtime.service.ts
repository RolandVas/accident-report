import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  startSession(): void {
    console.log('Realtime session started');
  }

  stopSession(): void {
    console.log('Realtime session stopped');
  }
}

