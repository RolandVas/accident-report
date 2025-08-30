import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PersonalData } from '../accident-data/accident-data.module';

@Component({
  selector: 'app-personal-data-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2 class="section-title">Persönliche Daten & Versicherung</h2>
      
      <form [formGroup]="personalForm" (ngSubmit)="onSubmit()">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="vorname">Vorname *</label>
            <input 
              type="text" 
              id="vorname" 
              formControlName="vorname" 
              class="form-input"
              placeholder="Max"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="nachname">Nachname *</label>
            <input 
              type="text" 
              id="nachname" 
              formControlName="nachname" 
              class="form-input"
              placeholder="Mustermann"
            >
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="geburtsdatum">Geburtsdatum *</label>
            <input 
              type="date" 
              id="geburtsdatum" 
              formControlName="geburtsdatum" 
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="fuehrerscheinNummer">Führerschein-Nr.</label>
            <input 
              type="text" 
              id="fuehrerscheinNummer" 
              formControlName="fuehrerscheinNummer" 
              class="form-input"
              placeholder="D123456789"
            >
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="adresse">Straße & Hausnummer *</label>
          <input 
            type="text" 
            id="adresse" 
            formControlName="adresse" 
            class="form-input"
            placeholder="Musterstraße 123"
          >
        </div>

        <div class="grid-3">
          <div class="form-group">
            <label class="form-label" for="plz">PLZ *</label>
            <input 
              type="text" 
              id="plz" 
              formControlName="plz" 
              class="form-input"
              placeholder="12345"
              maxlength="5"
            >
          </div>
          
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label" for="ort">Ort *</label>
            <input 
              type="text" 
              id="ort" 
              formControlName="ort" 
              class="form-input"
              placeholder="Musterstadt"
            >
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="telefon">Telefonnummer</label>
            <input 
              type="tel" 
              id="telefon" 
              formControlName="telefon" 
              class="form-input"
              placeholder="+49 123 456789"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="email">E-Mail-Adresse</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-input"
              placeholder="max.mustermann@email.de"
            >
          </div>
        </div>

        <div class="card" style="background-color: #f8fafc; margin-top: 2rem;">
          <h3 class="section-title">Versicherungsdaten</h3>
          
          <div class="form-group">
            <label class="form-label" for="versicherung">Versicherungsgesellschaft *</label>
            <input 
              type="text" 
              id="versicherung" 
              formControlName="versicherung" 
              class="form-input"
              placeholder="Muster Versicherung AG"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="polizzennummer">Polizzennummer *</label>
            <input 
              type="text" 
              id="polizzennummer" 
              formControlName="polizzennummer" 
              class="form-input"
              placeholder="VS-123456789"
            >
          </div>
        </div>
      </form>
    </div>
  `
})
export class PersonalDataTabComponent {
  @Input() data: PersonalData | null = null;
  @Output() dataChange = new EventEmitter<PersonalData>();
  
  personalForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.personalForm = this.fb.group({
      vorname: ['', Validators.required],
      nachname: ['', Validators.required],
      geburtsdatum: ['', Validators.required],
      adresse: ['', Validators.required],
      plz: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      ort: ['', Validators.required],
      telefon: [''],
      email: ['', Validators.email],
      fuehrerscheinNummer: [''],
      versicherung: ['', Validators.required],
      polizzennummer: ['', Validators.required]
    });

    this.personalForm.valueChanges.subscribe(value => {
      this.dataChange.emit(value);
    });
  }

  ngOnInit() {
    if (this.data) {
      this.personalForm.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.personalForm.valid) {
      this.dataChange.emit(this.personalForm.value);
    }
  }
}