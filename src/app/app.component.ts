import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PersonalDataTabComponent } from './components/personal-data-tab.component';
import { FahrzeugDatenTabComponent } from './components/fahrzeug-daten-tab.component';
import { UnfallDetailsTabComponent } from './components/unfall-details-tab.component';
import { SummaryTabComponent } from './components/summary-tab.component';
import { FahrzeugDaten, PersonalData, UnfallDetails, UnfallFormData } from './accident-data/accident-data.module';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    CommonModule,
    PersonalDataTabComponent,
    UnfallDetailsTabComponent,
    FahrzeugDatenTabComponent,
    SummaryTabComponent],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <header class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">KFZ Unfall-Meldung</h1>
          <p class="text-gray-600">Erfassen Sie alle relevanten Daten zu Ihrem Verkehrsunfall</p>
        </header>

        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <nav class="tab-nav">
            <button 
              *ngFor="let tab of tabs; let i = index"
              class="tab-button"
              [class.active]="activeTab === i"
              (click)="setActiveTab(i)"
            >
              <span class="mr-2">{{tab.icon}}</span>
              {{tab.label}}
            </button>
          </nav>

          <div class="p-6">
            <app-personal-data-tab
              *ngIf="activeTab === 0"
              [data]="formData.personalData"
              (dataChange)="updatePersonalData($event)"
            ></app-personal-data-tab>

            <app-unfall-details-tab
              *ngIf="activeTab === 1"
              [data]="formData.unfallDetails"
              (dataChange)="updateUnfallDetails($event)"
            ></app-unfall-details-tab>

            <app-fahrzeug-daten-tab
              *ngIf="activeTab === 2"
              [data]="formData.fahrzeugDaten"
              (dataChange)="updateFahrzeugDaten($event)"
            ></app-fahrzeug-daten-tab>

            <app-summary-tab
              *ngIf="activeTab === 3"
              [data]="formData"
            ></app-summary-tab>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex justify-between items-center border-t">
            <button 
              *ngIf="activeTab > 0"
              class="btn btn-secondary"
              (click)="previousTab()"
            >
              ← Zurück
            </button>
            <div class="flex-1"></div>
            <div class="text-sm text-gray-500 mx-4">
              Schritt {{activeTab + 1}} von {{tabs.length}}
            </div>
            <div class="flex-1"></div>
            <button 
              *ngIf="activeTab < tabs.length - 1"
              class="btn btn-primary"
              (click)="nextTab()"
            >
              Weiter →
            </button>
          </div>
        </div>

        <div class="text-center mt-6 text-sm text-gray-500">
          <p>⚠️ Alle Daten werden nur lokal in Ihrem Browser verarbeitet und nicht gespeichert.</p>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  activeTab = 0;
  
  tabs = [
    { label: 'Persönliche Daten', icon: '👤' },
    { label: 'Unfalldetails', icon: '🚗' },
    { label: 'Fahrzeugdaten', icon: '🔧' },
    { label: 'Zusammenfassung', icon: '📋' }
  ];

  formData: UnfallFormData = {
    personalData: {} as PersonalData,
    unfallDetails: {} as UnfallDetails,
    fahrzeugDaten: {} as FahrzeugDaten
  };

  setActiveTab(index: number) {
    this.activeTab = index;
  }

  nextTab() {
    if (this.activeTab < this.tabs.length - 1) {
      this.activeTab++;
    }
  }

  previousTab() {
    if (this.activeTab > 0) {
      this.activeTab--;
    }
  }

  updatePersonalData(data: PersonalData) {
    this.formData.personalData = data;
  }

  updateUnfallDetails(data: UnfallDetails) {
    this.formData.unfallDetails = data;
  }

  updateFahrzeugDaten(data: FahrzeugDaten) {
    this.formData.fahrzeugDaten = data;
  }
}
