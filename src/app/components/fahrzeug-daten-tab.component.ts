import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FahrzeugDaten } from '../accident-data/accident-data.module';

@Component({
  selector: 'app-fahrzeug-daten-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2 class="section-title">Fahrzeugdaten & Schäden</h2>
      
      <form [formGroup]="fahrzeugForm" (ngSubmit)="onSubmit()">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="marke">Fahrzeugmarke *</label>
            <input 
              type="text" 
              id="marke" 
              formControlName="marke" 
              class="form-input"
              placeholder="BMW"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="modell">Modell *</label>
            <input 
              type="text" 
              id="modell" 
              formControlName="modell" 
              class="form-input"
              placeholder="3er Touring"
            >
          </div>
        </div>

        <div class="grid-3">
          <div class="form-group">
            <label class="form-label" for="kennzeichen">Kennzeichen *</label>
            <input 
              type="text" 
              id="kennzeichen" 
              formControlName="kennzeichen" 
              class="form-input"
              placeholder="M-AB 1234"
              style="text-transform: uppercase;"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="farbe">Fahrzeugfarbe</label>
            <input 
              type="text" 
              id="farbe" 
              formControlName="farbe" 
              class="form-input"
              placeholder="Schwarz"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="baujahr">Baujahr</label>
            <input 
              type="number" 
              id="baujahr" 
              formControlName="baujahr" 
              class="form-input"
              placeholder="2020"
              min="1950"
              max="2025"
            >
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fahrgestellnummer">Fahrgestellnummer (FIN)</label>
          <input 
            type="text" 
            id="fahrgestellnummer" 
            formControlName="fahrgestellnummer" 
            class="form-input"
            placeholder="WBA3A5G50DNS12345"
            maxlength="17"
          >
        </div>

        <div class="card" style="background-color: #fef3f2; margin-top: 2rem;">
          <h3 class="section-title">Schadensinformationen</h3>
          
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="schadenshoehe">Geschätzte Schadenshöhe (€)</label>
              <input 
                type="number" 
                id="schadenshoehe" 
                formControlName="schadenshoehe" 
                class="form-input"
                placeholder="5000"
                min="0"
                step="100"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="reparaturWerkstatt">Gewünschte Reparaturwerkstatt</label>
              <input 
                type="text" 
                id="reparaturWerkstatt" 
                formControlName="reparaturWerkstatt" 
                class="form-input"
                placeholder="Auto Müller GmbH"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="schadensBeschreibung">Detaillierte Schadensbeschreibung *</label>
            <textarea 
              id="schadensBeschreibung" 
              formControlName="schadensBeschreibung" 
              class="form-textarea"
              placeholder="Beschreiben Sie alle sichtbaren Schäden am Fahrzeug..."
              rows="5"
            ></textarea>
          </div>

          <div class="checkbox-group">
            <input 
              type="checkbox" 
              id="fahrzeugFahrbereit" 
              formControlName="fahrzeugFahrbereit"
            >
            <label for="fahrzeugFahrbereit" class="form-label" style="margin-bottom: 0;">
              Fahrzeug ist nach dem Unfall noch fahrbereit
            </label>
          </div>
        </div>
      </form>
    </div>
  `
})
export class FahrzeugDatenTabComponent {
  @Input() data: FahrzeugDaten | null = null;
  @Output() dataChange = new EventEmitter<FahrzeugDaten>();
  
  fahrzeugForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.fahrzeugForm = this.fb.group({
      marke: ['', Validators.required],
      modell: ['', Validators.required],
      kennzeichen: ['', Validators.required],
      farbe: [''],
      baujahr: [''],
      fahrgestellnummer: [''],
      schadenshoehe: [''],
      schadensBeschreibung: ['', Validators.required],
      reparaturWerkstatt: [''],
      fahrzeugFahrbereit: [true]
    });

    this.fahrzeugForm.valueChanges.subscribe(value => {
      this.dataChange.emit(value);
    });
  }

  ngOnInit() {
    if (this.data) {
      this.fahrzeugForm.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.fahrzeugForm.valid) {
      this.dataChange.emit(this.fahrzeugForm.value);
    }
  }
}