// src/app/dashboard/components/process-table/process-table.component.ts
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../core/services/data.service';
import { ProcessData } from '../../../../shared/models/process-data.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-process-table',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './process-table.component.html',
  styleUrls: ['./process-table.component.css']
})
export class ProcessTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'businessUnit', 
    'processName', 
    'minItems', 
    'goLiveDate', 
    'total',
    'details'
  ];
  
  dataSource: any[] = [];
  selectedProcess: ProcessData | null = null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  
  private subscription = new Subscription();
  
  constructor(private dataService: DataService, private dialog: MatDialog) {}
  
  ngOnInit(): void {
    this.subscription.add(
      this.dataService.filteredDataObservable.subscribe(data => {
        this.prepareTableData(data);
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.table) {
        this.table.dataSource = this.dataSource;
      }
    });
  }
  
  prepareTableData(data: ProcessData[]): void {
    const tableData = data.map(process => {
      const totalProcessed = process.monthlyData.reduce((sum, point) => sum + point.value, 0);
      
      return {
        ...process,
        total: totalProcessed
      };
    });
    
    this.dataSource = tableData;
    
    setTimeout(() => {
      if (this.table) {
        this.table.dataSource = this.dataSource;
      }
    });
  }
  
  viewDetails(process: ProcessData): void {
    this.selectedProcess = process;
  }
  
  closeDetails(): void {
    this.selectedProcess = null;
  }
  
  getMonthlyDataArray(process: ProcessData): {month: string, value: number}[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sort data by year and month
    const sortedData = [...process.monthlyData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    return sortedData.map(point => {
      const monthName = monthNames[point.month - 1];
      const label = `${monthName}-${(point.year % 100).toString().padStart(2, '0')}`;
      return {
        month: label,
        value: point.value
      };
    });
  }
}
