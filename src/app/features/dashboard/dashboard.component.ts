// src/app/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../core/services/data.service';
import { OverviewComponent } from './components/overview/overview.component';
import { ProcessChartComponent } from './components/process-chart/process-chart.component';
import { ProcessTableComponent } from './components/process-table/process-table.component';
import { FilterComponent } from './components/filter/filter.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    OverviewComponent,
    ProcessChartComponent,
    ProcessTableComponent,
    FilterComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  
  constructor(private dataService: DataService) {}
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.dataService.loadDataFromExcel(file);
    }
  }
  
  onLoadFromApi(): void {
    // Replace with your actual API endpoint
    this.dataService.loadDataFromApi('https://your-api-endpoint/process-data');
  }
  
  onSearch(searchValue: string): void {
    this.dataService.setSearchText(searchValue);
  }
  
  onFilterBusinessUnit(businessUnit: string): void {
    this.dataService.setSelectedBusinessUnit(businessUnit);
  }
}
