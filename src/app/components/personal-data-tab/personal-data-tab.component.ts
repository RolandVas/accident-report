import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PersonalData } from '../../accident-data/accident-data.module';

@Component({
  selector: 'app-personal-data-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-data-tab.component.html',
  styleUrls: ['./personal-data-tab.component.scss']
})
export class PersonalDataTabComponent implements OnChanges {
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
      this.personalForm.patchValue(this.data, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.personalForm.patchValue(changes['data'].currentValue, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.personalForm.valid) {
      this.dataChange.emit(this.personalForm.value);
    }
  }
}
