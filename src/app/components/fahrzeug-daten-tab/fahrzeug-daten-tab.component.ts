import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FahrzeugDaten } from '../../accident-data/accident-data.module';

@Component({
  selector: 'app-fahrzeug-daten-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fahrzeug-daten-tab.component.html',
  styleUrls: ['./fahrzeug-daten-tab.component.scss']
})
export class FahrzeugDatenTabComponent implements OnChanges {
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
      this.fahrzeugForm.patchValue(this.data, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.fahrzeugForm.patchValue(changes['data'].currentValue, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.fahrzeugForm.valid) {
      this.dataChange.emit(this.fahrzeugForm.value);
    }
  }
}
