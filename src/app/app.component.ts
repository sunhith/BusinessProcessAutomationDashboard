import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BusinessProcessAutomationDashboard';
  constructor() {
    Chart.register(...registerables);
  }
}
