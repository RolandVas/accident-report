import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OPEN_AI_API } from '../../api/open-ai-api';
import { UnfallFormData } from '../accident-data/accident-data.module';

@Injectable()
export class RealtimeService {
  // Aktueller WebRTC-Verbindungskanal
  private pc?: RTCPeerConnection;
  // Datenkanal zum Senden und Empfangen von Ereignissen
  private dc?: RTCDataChannel;
  // Lokaler Audiostream (Mikrofon)
  private ms?: MediaStream;
  // Verstecktes Audioelement zur Wiedergabe des Remote-Audios
  private audioEl?: HTMLAudioElement;

  // Subjekt für Formularaktualisierungen
  private formUpdatesSubject = new Subject<Partial<UnfallFormData>>();
  formUpdates$: Observable<Partial<UnfallFormData>> = this.formUpdatesSubject.asObservable();

  // Basis-URL und Model für den Realtime-Endpunkt
  private baseUrl = 'https://api.openai.com/v1/realtime';
  private model = 'gpt-4o-realtime-preview';

  private test_api = 'asdfeloelokgok3242390423'

  constructor(private zone: NgZone) {}

  /**
   * Startet eine neue Realtime-Sitzung über WebRTC.
   * Stellt eine Verbindung zum OpenAI Realtime-Endpoint her
   * und richtet Audio- sowie Datenkanäle ein.
   */
  async startSession(): Promise<void> {
    // Vorhandene Sitzung stoppen
    if (this.pc) {
      this.stopSession();
    }

    // PeerConnection erstellen
    this.pc = new RTCPeerConnection();

    // Audioelement für Remote-Audio vorbereiten
    this.audioEl = document.createElement('audio');
    this.audioEl.autoplay = true;
    this.pc.ontrack = (event) => {
      // Eingehende Audiospuren auf dem Audioelement abspielen
      if (this.audioEl) {
        this.audioEl.srcObject = event.streams[0];
      }
    };

    // Mikrofonzugriff anfordern und Spur hinzufügen
    this.ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.pc.addTrack(this.ms.getTracks()[0]);

    // Datenkanal für Events einrichten
    this.dc = this.pc.createDataChannel('oai-events');
    this.dc.addEventListener('message', (e) => {
      console.log('Realtime server event', e);
      try {
        const message = JSON.parse(e.data);
        console.log('message', message)
        if (message.type === 'form_update' && message.data) {
          this.zone.run(() => this.formUpdatesSubject.next(message.data));
        }
      } catch {
        // Ignoriere fehlerhafte Nachrichten
        console.log('fehler')
      }
    });

    // SDP-Angebot erstellen und an den Realtime-Server senden
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    const sdpResponse = await fetch(`${this.baseUrl}?model=${this.model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${this.test_api}`,
        'Content-Type': 'application/sdp',
      },
    });

    // Antwort des Servers setzen, um Verbindung zu vervollständigen
    const answer = { type: 'answer', sdp: await sdpResponse.text() };
    await this.pc.setRemoteDescription(answer as RTCSessionDescriptionInit);
  }

  /**
   * Beendet die aktive Realtime-Sitzung und gibt Ressourcen frei.
   */
  stopSession(): void {
    this.dc?.close();
    this.pc?.close();
    this.ms?.getTracks().forEach((t) => t.stop());
    this.dc = undefined;
    this.pc = undefined;
    this.ms = undefined;
  }
}

