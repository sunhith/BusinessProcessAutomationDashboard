// src/app/dashboard/components/overview/overview.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ChartsModule } from '../../../../shared/charts.module';
import { DataService } from '../../../../core/services/data.service';
import { ProcessSummary } from '../../../../shared/models/process-data.model';
import { Chart, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ChartsModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  summary: ProcessSummary | null = null;
  isBrowser: boolean;
  
  chartData: any;
  chartOptions: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataService: DataService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      Chart.register(
        CategoryScale,
        LinearScale,
        BarElement,
        BarController
      );
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeChart();
      this.subscribeToData();
    }
  }

  private initializeChart() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { 
        y: { beginAtZero: true },
        x: { type: 'category' }
      }
    };
  }

  private subscribeToData() {
    this.dataService.summaryObservable.subscribe(data => {
      this.summary = data;
      if (data) this.updateChartData(data);
    });
  }

  private updateChartData(summary: ProcessSummary) {
    const sortedData = [...summary.monthlyTotals].sort((a, b) => 
      a.year === b.year ? a.month - b.month : a.year - b.year
    );
    
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                       'Jul','Aug','Sep','Oct','Nov','Dec'];
    
    this.chartData = {
      labels: sortedData.map(p => 
        `${monthNames[p.month - 1]}-${(p.year % 100).toString().padStart(2, '0')}`
      ),
      datasets: [{
        data: sortedData.map(p => p.value),
        label: 'Monthly Processed Items',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  }
}
