import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnfallFormData } from '../../accident-data/accident-data.module';

@Component({
  selector: 'app-summary-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-tab.component.html',
  styleUrls: ['./summary-tab.component.scss']
})
export class SummaryTabComponent {
  @Input() data: UnfallFormData | null = null;

  printForm() {
    window.print();
  }

  resetForm() {
    if (confirm('Möchten Sie wirklich alle eingegebenen Daten löschen?')) {
      window.location.reload();
    }
  }
}
