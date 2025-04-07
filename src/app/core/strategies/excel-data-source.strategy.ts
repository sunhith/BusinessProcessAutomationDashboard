// src/app/core/strategies/excel-data-source.strategy.ts
import { Injectable } from '@angular/core';
import { DataSourceStrategy } from './data-source.strategy';
import { ProcessData } from '../../shared/models/process-data.model';
import { ExcelService } from '../services/excel.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelDataSourceStrategy implements DataSourceStrategy {
  constructor(private excelService: ExcelService) {}
  
  async loadData(file: File): Promise<ProcessData[]> {
    try {
      return await this.excelService.importExcel(file);
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return [];
    }
  }
}
