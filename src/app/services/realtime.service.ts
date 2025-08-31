import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OPEN_AI_API } from '../../api/open-ai-api';
import { UnfallFormData } from '../accident-data/accident-data.module';

type PartialForm = Partial<UnfallFormData>;

@Injectable()
export class RealtimeService {
  // Aktueller WebRTC-Verbindungskanal
  private peerConnection?: RTCPeerConnection;
  // Datenkanal zum Senden und Empfangen von Ereignissen
  private dataChannel?: RTCDataChannel;
  // Lokaler Audiostream (Mikrofon)
  private lokalMediaStream?: MediaStream;
  // Verstecktes Audioelement zur Wiedergabe des Remote-Audios
  private audioEl?: HTMLAudioElement;

  private toolArgBuf: Record<string, string> = {};

  private formUpdatesSubject = new Subject<Partial<UnfallFormData>>();
  formUpdates$: Observable<Partial<UnfallFormData>> = this.formUpdatesSubject.asObservable();

  private tabChangeSubject = new Subject<number>();
  tabChange$ = this.tabChangeSubject.asObservable();

  private baseUrl = 'https://api.openai.com/v1/realtime';
  private model = 'gpt-4o-realtime-preview';

  private test_api = 'asdfeloelokgok3242390423'

  constructor(private zone: NgZone) { }

  /**
   * Startet eine neue Realtime-Sitzung über WebRTC.
   * Stellt eine Verbindung zum OpenAI Realtime-Endpoint her
   * und richtet Audio- sowie Datenkanäle ein.
   */
  async startSession(): Promise<void> {
    // Vorhandene Sitzung stoppen
    if (this.peerConnection) {
      this.stopSession();
    }

    this.peerConnection = new RTCPeerConnection();

    // Audioelement für Remote-Audio vorbereiten
    this.audioEl = document.createElement('audio');
    this.audioEl.autoplay = true;
    this.peerConnection.ontrack = (event) => {
      if (this.audioEl) {
        this.audioEl.srcObject = event.streams[0];
      }
    };

    // Mikrofonzugriff anfordern und Spur hinzufügen
    this.lokalMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.peerConnection.addTrack(this.lokalMediaStream.getTracks()[0]);

    // Datenkanal für Events einrichten
    this.dataChannel = this.peerConnection.createDataChannel('oai-events');
    this.dataChannel.addEventListener('open', () => this.onChannelOpen());
    this.dataChannel.addEventListener('message', (ev) => this.onMessage(ev)); 

    // SDP-Angebot erstellen und an den Realtime-Server senden
    const SDP_offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(SDP_offer);

    // console.log('SDP', SDP_offer.sdp)

    const sdpResponse = await fetch(`${this.baseUrl}?model=${this.model}`, {
      method: 'POST',
      body: SDP_offer.sdp,
      headers: {
        Authorization: `Bearer ${OPEN_AI_API}`,
        'Content-Type': 'application/sdp',
      },
    });

    // Antwort des Servers setzen, um Verbindung zu vervollständigen
    const answer = { type: 'answer', sdp: await sdpResponse.text() };
    // console.log('answer', answer.sdp)
    await this.peerConnection.setRemoteDescription(answer as RTCSessionDescriptionInit);
  }

  private onChannelOpen() {
    if (this.dataChannel?.readyState !== 'open') return;

    // 1) Sitzung mit Tool (Function-Calling) konfigurieren
    const sessionUpdate = {
      type: 'session.update',
      session: {
        voice: 'alloy',
        modalities: ['text', 'audio'],
        instructions:
          'Du bist ein deutschsprachiger Assistent, der ein KFZ-Unfallformular ausfüllt. ' +
          'Wenn der Nutzer Werte nennt (z. B. "Mein Vorname ist Roland"), ' +
          'verwende IMMER das Tool set_form_values mit minimalen Änderungen und ohne Fantasiewerte.' +
          'Tabs: 0 = Persönliche Daten, 1 = Unfalldetails, 2 = Fahrzeugdaten, 3 = Zusammenfassung.',
        tools: [
          {
            type: 'function',
            name: 'set_form_values',
            description:
              'Fülle oder aktualisiere Felder im Unfall-Formular. Sende nur geänderte Keys.',
            parameters: {
              type: 'object',
              properties: {
                personalData: {
                  type: 'object',
                  properties: {
                    vorname: { type: 'string' },
                    nachname: { type: 'string' },
                    geburtsdatum: { type: 'string' },
                    adresse: { type: 'string' },
                    plz: { type: 'string' },
                    ort: { type: 'string' },
                    telefon: { type: 'string' },
                    email: { type: 'string' },
                    fuehrerscheinNummer: { type: 'string' },
                    versicherung: { type: 'string' },
                    polizzennummer: { type: 'string' }
                  },
                  additionalProperties: false
                },
                unfallDetails: {
                  type: 'object',
                  properties: {
                    unfallDatum: { type: 'string' },
                    unfallZeit: { type: 'string' },
                    unfallOrt: { type: 'string' },
                    witterung: { type: 'string' },
                    strassenverhaeltnisse: { type: 'string' },
                    unfallhergang: { type: 'string' },
                    polizeiRuecksprache: { type: 'boolean' },
                    polizeiAktenzeichen: { type: 'string' },
                    zeugen: { type: 'string' },
                    verletzungen: { type: 'boolean' },
                    verletzungsBeschreibung: { type: 'string' }
                  },
                  additionalProperties: false
                },
                fahrzeugDaten: {
                  type: 'object',
                  properties: {
                    marke: { type: 'string' },
                    modell: { type: 'string' },
                    kennzeichen: { type: 'string' },
                    farbe: { type: 'string' },
                    baujahr: { type: 'number' },
                    fahrgestellnummer: { type: 'string' },
                    schadenshoehe: { type: 'number' },
                    schadensBeschreibung: { type: 'string' },
                    reparaturWerkstatt: { type: 'string' },
                    fahrzeugFahrbereit: { type: 'boolean' }
                  },
                  additionalProperties: false
                }
              },
              additionalProperties: false
            }
          },
          {
            type: 'function',
            name: 'set_active_tab',
            description:
              'Wechsle den sichtbaren Tab. Nutze entweder index (0–3) oder tab als Name: ' +
              '"personalData", "unfallDetails", "fahrzeugDaten", "Zusammenfassung".',
            parameters: {
              type: 'object',
              properties: {
                index: { type: 'number' },
                tab: {
                  type: 'string',
                  enum: ['personalData', 'unfallDetails', 'fahrzeugDaten', 'summary']
                }
              },
              required: ["tab"],
              additionalProperties: false
            }
          }
        ],
        tool_choice: 'auto'
      }
    };
    this.dataChannel.send(JSON.stringify(sessionUpdate));

    // 2) kurze Start-Antwort (Text + Audio)
    const start = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions:
          'Hallo! Ich helfe beim Ausfüllen.'
      }
    };
    this.dataChannel.send(JSON.stringify(start));
  }

  /** Eingehende Realtime-Events verarbeiten */
  private onMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);
      console.log('msg', msg)

      switch (msg.type) {
        // gestreamte Funktions-Argumente (zusammenstückeln)
        case 'response.function_call_arguments.delta': {
          const id = msg.call_id as string;
          const part = msg.delta as string;
          this.toolArgBuf[id] = (this.toolArgBuf[id] ?? '') + (part ?? '');
          break;
        }

        // Funktion fertig – jetzt anwenden + quittieren
        case 'response.function_call_arguments.done': {
          if (msg.name === 'set_form_values') {
            const id = msg.call_id as string;
            const jsonStr = this.toolArgBuf[id] ?? msg.arguments ?? '{}';
            delete this.toolArgBuf[id];

            let payload: PartialForm = {};
            try { payload = JSON.parse(jsonStr); } catch { }

            this.zone.run(() => this.formUpdatesSubject.next(payload));

            // 1) Tool-Output an Konversation anhängen
            this.dataChannel?.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: id,
                output: JSON.stringify({ applied: Object.keys(payload || {}) })
              }
            }));

            // 2) Modell antworten lassen (Audio/Text)
            this.dataChannel?.send(JSON.stringify({
              type: 'response.create',
              response: { modalities: ['text', 'audio'] }
            }));
          }

          if (msg.name === 'set_active_tab') {
            const tabMap: Record<string, number> = {
              "personaldata": 0,
              "persönliche daten": 0,
              "personliche daten": 0,
              "unfalldetails": 1,
              "fahrzeugdaten": 2,
              "summary": 3,
              "zusammenfassung": 3
            };

            const id = msg.call_id as string;
            const jsonStr = this.toolArgBuf[id] ?? msg.arguments ?? '{}';
            delete this.toolArgBuf[id];

            let payload: {tab: string} = {tab: ''};
            try { payload = JSON.parse(jsonStr); } catch { }

            console.log('payload', payload)
      
            const idx = tabMap[payload.tab.toLowerCase()];

            console.log('index', idx)
            if (idx !== undefined) {
              this.zone.run(() => this.tabChangeSubject.next(idx));
            }

            this.dataChannel?.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: id,
                output: JSON.stringify({ switchedTo: idx })
              }
            }));
            this.dataChannel?.send(JSON.stringify({ type: 'response.create', response: { modalities: ['text','audio'] } }));
          }

          break;
        }

        // (Optional) Finale Text/Audio-Fertig-Events kannst du hier loggen
        case 'response.done':
        case 'response.text.delta':
        case 'response.audio_transcript.delta':
          // console.log(msg);
          break;
      }
    } catch {
      // ignore parse errors
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // /** Eingehende Realtime-Events verarbeiten */
  // private onMessage(event: MessageEvent) {
  //   try {
  //     const msg = JSON.parse(event.data as string);
  //     (this as any).toolArgBuf ??= {};
  //     const toBool = (v: any): boolean | undefined => {
  //       if (typeof v === 'boolean') return v;
  //       if (typeof v === 'string') {
  //         const s = v.trim().toLowerCase();
  //         if (['ja', 'yes', 'true', '1'].includes(s)) return true;
  //         if (['nein', 'no', 'false', '0'].includes(s)) return false;
  //       }
  //       return undefined;
  //     };
  //     const toNum = (v: any): number | undefined => {
  //       if (typeof v === 'number' && Number.isFinite(v)) return v;
  //       const n = Number(String(v).replace(/[^\d.\-]/g, ''));
  //       return Number.isFinite(n) ? n : undefined;
  //     };
  //     const pruneUndef = (o: any) => {
  //       if (!o || typeof o !== 'object') return o;
  //       Object.keys(o).forEach(k => {
  //         const v = o[k];
  //         if (v && typeof v === 'object') pruneUndef(v);
  //         if (v === undefined) delete o[k];
  //       });
  //       return o;
  //     };
  //     const resolveTabIndex = (x: any): number | undefined => {
  //       if (typeof x === 'number' && x >= 0 && x <= 3) return x;
  //       const s = String(x ?? '').toLowerCase().replace(/[\s._-]/g, '');
  //       const map: Record<string, number> = {
  //         '0':0,'1':1,'2':2,'3':3,
  //         'personaldata':0,'persönlichedaten':0,'personlichedaten':0,'personal':0,
  //         'unfalldetails':1,'unfall':1,'details':1,
  //         'fahrzeugdaten':2,'fahrzeug':2,'vehicle':2,'auto':2,
  //         'summary':3,'zusammenfassung':3,'ueberblick':3,'überblick':3
  //       };
  //       return map[s];
  //     };

  //     switch (msg.type) {
  //       case 'response.function_call_arguments.delta': {
  //         const id = msg.call_id as string;
  //         const part = (msg.delta as string) ?? '';
  //         (this as any).toolArgBuf[id] = ((this as any).toolArgBuf[id] ?? '') + part;
  //         break;
  //       }

  //       case 'response.function_call_arguments.done': {
  //         const id = msg.call_id as string;
  //         const raw =
  //           ((this as any).toolArgBuf?.[id] as string | undefined) ??
  //           (msg.arguments as string | undefined) ??
  //           '{}';
  //         if ((this as any).toolArgBuf) delete (this as any).toolArgBuf[id];

  //         let args: any = {};
  //         try { args = JSON.parse(raw); } catch { args = {}; }

  //         if (msg.name === 'set_form_values') {
  //           const out: Partial<UnfallFormData> = {};

  //           if (args.personalData) {
  //             out.personalData = { ...args.personalData };
  //           }
  //           if (args.unfallDetails) {
  //             const s = args.unfallDetails;
  //             out.unfallDetails = {
  //               ...s,
  //               polizeiRuecksprache:
  //                 s.polizeiRuecksprache !== undefined ? toBool(s.polizeiRuecksprache) : undefined,
  //               verletzungen:
  //                 s.verletzungen !== undefined ? toBool(s.verletzungen) : undefined
  //             } as any;
  //           }
  //           if (args.fahrzeugDaten) {
  //             const s = args.fahrzeugDaten;
  //             out.fahrzeugDaten = {
  //               ...s,
  //               baujahr: s.baujahr !== undefined ? toNum(s.baujahr) : undefined,
  //               schadenshoehe: s.schadenshoehe !== undefined ? toNum(s.schadenshoehe) : undefined,
  //               fahrzeugFahrbereit:
  //                 s.fahrzeugFahrbereit !== undefined ? toBool(s.fahrzeugFahrbereit) : undefined
  //             } as any;
  //           }

  //           pruneUndef(out);
  //           this.zone.run(() => this.formUpdatesSubject.next(out));

  //           // Tool-Output + Folgeantwort
  //           this.dataChannel?.send(JSON.stringify({
  //             type: 'conversation.item.create',
  //             item: { type: 'function_call_output', call_id: id, output: JSON.stringify({ applied: Object.keys(out) }) }
  //           }));
  //           this.dataChannel?.send(JSON.stringify({ type: 'response.create', response: { modalities: ['text','audio'] } }));
  //         }

  //         if (msg.name === 'set_active_tab') {
  //           let idx: number | undefined = undefined;
  //           if (args.index !== undefined) idx = resolveTabIndex(args.index);
  //           if (idx === undefined && args.tab !== undefined) idx = resolveTabIndex(args.tab);

  //           if (idx !== undefined) {
  //             this.zone.run(() => this.tabChangeSubject.next(idx));
  //           }

  //           this.dataChannel?.send(JSON.stringify({
  //             type: 'conversation.item.create',
  //             item: {
  //               type: 'function_call_output',
  //               call_id: id,
  //               output: JSON.stringify({ switchedTo: idx })
  //             }
  //           }));
  //           this.dataChannel?.send(JSON.stringify({ type: 'response.create', response: { modalities: ['text','audio'] } }));
  //         }

  //         break;
  //       }

  //       // optional: Logs
  //       case 'response.text.delta':
  //       case 'response.audio_transcript.delta':
  //       case 'response.done':
  //         // console.log(msg);
  //         break;
  //     }
  //   } catch {
  //     // ignore malformed frames
  //   }
  // }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /** Freitext an den Assistenten senden (nicht notwendig bei Sprache) */
  sendText(text: string) {
    if (this.dataChannel?.readyState !== 'open') return;
    // Text ins Gespräch legen …
    this.dataChannel.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));
    // … und Antwort anfordern
    this.dataChannel.send(JSON.stringify({ type: 'response.create', response: { modalities: ['text', 'audio'] } }));
  }

  /**
   * Beendet die aktive Realtime-Sitzung und gibt Ressourcen frei.
   */
  stopSession(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.lokalMediaStream?.getTracks().forEach((t) => t.stop());
    this.dataChannel = undefined;
    this.peerConnection = undefined;
    this.lokalMediaStream = undefined;
  }
}

