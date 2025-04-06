// src/app/core/services/data.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProcessData, ProcessSummary, MonthlyDataPoint } from '../../shared/models/process-data.model';
import { ExcelService } from './excel.service';
import { httpResource } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private processDataSignal = signal<ProcessData[]>([]);
  private searchTextSignal = signal<string>('');
  private selectedBusinessUnitSignal = signal<string>('');
  
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
  ) { }
  
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
  
  async loadDataFromApi(url: string): Promise<void> {
    try {
      // Traditional HttpClient approach - more reliable for Angular 19.2
      this.http.get<ProcessData[]>(url).subscribe(data => {
        if (data) {
          this.processDataSignal.set(data);
        }
      });
      
      // Alternative: If you want to try httpResource
      /*
      const processDataResource = httpResource<ProcessData[]>(url);
      
      // Wait for the resource to load
      while (processDataResource.status() === 'loading') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check if the request was successful
      if (processDataResource.status() === 'success') {
        const data = processDataResource.value();
        if (data) {
          this.processDataSignal.set(data);
        }
      }
      */
    } catch (error) {
      console.error('Error loading API data:', error);
    }
  }
  
  async loadDataFromExcel(file: File): Promise<void> {
    try {
      const data = await this.excelService.importExcel(file);
      this.processDataSignal.set(data);
    } catch (error) {
      console.error('Error loading Excel data:', error);
    }
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
