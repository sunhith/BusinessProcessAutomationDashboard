import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DataService } from '../../../../core/services/data.service';
import { ProcessData } from '../../../../shared/models/process-data.model';

@Component({
  selector: 'app-process-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    BaseChartDirective
  ],
  templateUrl: './process-chart.component.html',
  styleUrls: ['./process-chart.component.css']
})
export class ProcessChartComponent implements OnInit {
  isBrowser: boolean;
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  constructor(
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      this.dataService.filteredDataObservable.subscribe(data => {
        this.updateChartData(data);
      });
    }
  }
  
  private updateChartData(data: ProcessData[]): void {
    if (!data.length) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }
    
    // Get all unique year/month combinations
    const allYearMonths = new Set<string>();
    data.forEach(process => {
      process.monthlyData.forEach(point => {
        allYearMonths.add(`${point.year}-${point.month}`);
      });
    });
    
    // Sort year-months
    const sortedYearMonths = Array.from(allYearMonths).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    
    // Create labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = sortedYearMonths.map(ym => {
      const [year, month] = ym.split('-').map(Number);
      const monthName = monthNames[month - 1];
      return `${monthName}-${(year % 100).toString().padStart(2, '0')}`;
    });
    
    // Limit to top 5 processes by total volume
    const topProcesses = [...data]
      .map(process => {
        const total = process.monthlyData.reduce((sum, point) => sum + point.value, 0);
        return { ...process, total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    // Generate colors for each process
    const colors = [
      { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
      { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
      { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
      { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
      { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }
    ];
    
    // Create dataset for each process
    const datasets = topProcesses.map((process, index) => {
      const color = colors[index % colors.length];
      
      // Create a map of year-month to value for this process
      const dataMap = new Map<string, number>();
      sortedYearMonths.forEach(ym => dataMap.set(ym, 0));
      
      process.monthlyData.forEach(point => {
        const key = `${point.year}-${point.month}`;
        dataMap.set(key, point.value);
      });
      
      // Convert map to array in the right order
      const dataPoints = sortedYearMonths.map(ym => dataMap.get(ym) || 0);
      
      return {
        label: process.processName,
        data: dataPoints,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
        fill: false,
        tension: 0.1
      };
    });
    
    this.chartData = {
      labels,
      datasets
    };
  }
}
