import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UnfallDetails } from '../../accident-data/accident-data.module';

@Component({
  selector: 'app-unfall-details-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unfall-details-tab.component.html',
  styleUrls: ['./unfall-details-tab.component.scss']
})
export class UnfallDetailsTabComponent implements OnChanges  {
  @Input() data: UnfallDetails | null = null;
  @Output() dataChange = new EventEmitter<UnfallDetails>();

  unfallForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.unfallForm = this.fb.group({
      unfallDatum: ['', Validators.required],
      unfallZeit: ['', Validators.required],
      unfallOrt: ['', Validators.required],
      witterung: [''],
      strassenverhaeltnisse: [''],
      unfallhergang: ['', Validators.required],
      polizeiRuecksprache: [false],
      polizeiAktenzeichen: [''],
      zeugen: [''],
      verletzungen: [false],
      verletzungsBeschreibung: ['']
    });

    this.unfallForm.valueChanges.subscribe(value => {
      this.dataChange.emit(value);
    });
  }

  ngOnInit() {
    if (this.data) {
      this.unfallForm.patchValue(this.data, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.unfallForm.patchValue(changes['data'].currentValue, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.unfallForm.valid) {
      this.dataChange.emit(this.unfallForm.value);
    }
  }
}
