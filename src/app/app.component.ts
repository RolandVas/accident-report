import { Component, inject } from '@angular/core';
import { RealtimeService } from './services/realtime.service';
import { CommonModule } from '@angular/common';
import { PersonalDataTabComponent } from './components/personal-data-tab/personal-data-tab.component';
import { FahrzeugDatenTabComponent } from './components/fahrzeug-daten-tab/fahrzeug-daten-tab.component';
import { UnfallDetailsTabComponent } from './components/unfall-details-tab/unfall-details-tab.component';
import { SummaryTabComponent } from './components/summary-tab/summary-tab.component';
import { FahrzeugDaten, PersonalData, UnfallDetails, UnfallFormData } from './accident-data/accident-data.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PersonalDataTabComponent, UnfallDetailsTabComponent, FahrzeugDatenTabComponent, SummaryTabComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'accident-report';
  activeTab = 0;
  assistantActive = false;

  private realtimeService: RealtimeService = inject(RealtimeService)

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

  constructor(private realtime: RealtimeService) {
    this.realtime.formUpdates$.subscribe(update => {
      this.formData = {
        personalData: { ...this.formData.personalData, ...(update.personalData || {}) },
        unfallDetails: { ...this.formData.unfallDetails, ...(update.unfallDetails || {}) },
        fahrzeugDaten: { ...this.formData.fahrzeugDaten, ...(update.fahrzeugDaten || {}) }
      };
    });

    this.realtime.tabChange$.subscribe(index => {
      this.activeTab = index;
    });
  }

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

  assistant() {
    if (!this.assistantActive) {
      this.realtimeService.startSession();
      this.assistantActive = true;
    } else {
      this.realtimeService.stopSession();
      this.assistantActive = false;
    }
  }
}

