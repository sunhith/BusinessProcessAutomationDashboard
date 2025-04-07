// src/app/core/services/data.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProcessData, ProcessSummary, MonthlyDataPoint } from '../../shared/models/process-data.model';
import { ExcelService } from './excel.service';
import { httpResource } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { DataSourceStrategy } from '../strategies/data-source.strategy';
import { ApiDataSourceStrategy } from '../strategies/api-data-source.strategy';
import { ExcelDataSourceStrategy } from '../strategies/excel-data-source.strategy';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private processDataSignal = signal<ProcessData[]>([]);
  private searchTextSignal = signal<string>('');
  private selectedBusinessUnitSignal = signal<string>('');

  // Add these at the top of your DataService class
  private apiStrategy: DataSourceStrategy;
  private excelStrategy: DataSourceStrategy;
  private currentStrategy: DataSourceStrategy;

  
  // Computed signals for derived data
  public filteredData = computed(() => {
    const data = this.processDataSignal();
    const searchText = this.searchTextSignal().toLowerCase();
    const businessUnit = this.selectedBusinessUnitSignal();
    
    return data.filter(item => {
      // Apply business unit filter if selected
      if (businessUnit && item.businessUnit !== businessUnit) {
        return false;
      }
      
      // Apply search text filter if provided
      if (searchText && 
          !item.processName.toLowerCase().includes(searchText) && 
          !item.businessUnit.toLowerCase().includes(searchText)) {
        return false;
      }
      
      return true;
    });
  });
  
  public summary = computed(() => {
    const data = this.processDataSignal();
    if (!data.length) return null;
    
    const businessUnits = new Set(data.map(item => item.businessUnit));
    const totalMinItems = data.reduce((sum, item) => sum + item.minItems, 0);
    
    // Get all unique year/month combinations
    const allYearMonths = new Set<string>();
    data.forEach(process => {
      process.monthlyData.forEach(point => {
        allYearMonths.add(`${point.year}-${point.month}`);
      });
    });
    
    // Create a map to store totals
    const monthlyTotalsMap = new Map<string, number>();
    allYearMonths.forEach(yearMonth => monthlyTotalsMap.set(yearMonth, 0));
    
    // Calculate totals
    let totalProcessedItems = 0;
    data.forEach(process => {
      process.monthlyData.forEach(point => {
        const key = `${point.year}-${point.month}`;
        const currentTotal = monthlyTotalsMap.get(key) || 0;
        monthlyTotalsMap.set(key, currentTotal + point.value);
        totalProcessedItems += point.value;
      });
    });
    
    // Convert map to array
    const monthlyTotals: { month: number; year: number; value: number }[] = [];
    monthlyTotalsMap.forEach((value, key) => {
      const [yearStr, monthStr] = key.split('-');
      monthlyTotals.push({
        year: parseInt(yearStr),
        month: parseInt(monthStr),
        value
      });
    });
    
    // Sort by year and month
    monthlyTotals.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    return {
      totalProcesses: data.length,
      totalBusinessUnits: businessUnits.size,
      averageMinItems: data.length ? totalMinItems / data.length : 0,
      totalProcessedItems,
      monthlyTotals
    } as ProcessSummary;
  });
  
  constructor(
    private http: HttpClient,
    private excelService: ExcelService
  ) {
    // Initialize strategies
    this.apiStrategy = new ApiDataSourceStrategy(http);
    this.excelStrategy = new ExcelDataSourceStrategy(excelService);
    
    // Default to Excel strategy
    this.currentStrategy = this.excelStrategy;
  }
  
    // Strategy selection methods
  useApiStrategy(): void {
    this.currentStrategy = this.apiStrategy;
  }

  useExcelStrategy(): void {
    this.currentStrategy = this.excelStrategy;
  }

  // Generic load method using current strategy
  async loadData(source: any): Promise<void> {
    try {
      const data = await this.currentStrategy.loadData(source);
      this.processDataSignal.set(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }


  
  // Observable for components that need reactivity
  processDataObservable = toObservable(this.processDataSignal);
  filteredDataObservable = toObservable(this.filteredData);
  summaryObservable = toObservable(this.summary);
  
  // Action methods
  setSearchText(text: string): void {
    this.searchTextSignal.set(text);
  }
  
  setSelectedBusinessUnit(unit: string): void {
    this.selectedBusinessUnitSignal.set(unit);
  }
  
 // Convenience methods (backward compatibility)
  async loadDataFromApi(url: string): Promise<void> {
    this.useApiStrategy();
    return this.loadData(url);
  }

  async loadDataFromExcel(file: File): Promise<void> {
    this.useExcelStrategy();
    return this.loadData(file);
  }
  
  getUniqueBusinessUnits(): string[] {
    const data = this.processDataSignal();
    const units = new Set<string>();
    
    data.forEach(process => {
      if (process.businessUnit) {
        units.add(process.businessUnit);
      }
    });
    
    return Array.from(units);
  }
}
