// src/app/core/services/excel.service.ts
import { Injectable } from '@angular/core';
import { ProcessData, MonthlyDataPoint } from '../../shared/models/process-data.model';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  
  constructor() { }
  
  importExcel(file: File): Promise<ProcessData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          
          // Get headers to identify month columns
          const headers = this.getHeaders(worksheet);
          const monthColumns = this.identifyMonthColumns(headers);
          
          const processData: ProcessData[] = jsonData.map((row: any) => {
            const monthlyData: MonthlyDataPoint[] = [];
            
            // Process each month column
            monthColumns.forEach(col => {
              const { month, year } = this.parseMonthYearHeader(col);
              const value = row[col] || 0;
              
              monthlyData.push({
                year,
                month,
                value
              });
            });
            
            return {
              businessUnit: row['Business Unit'] || '',
              processName: row['Process Name'] || '',
              minItems: row['Min/items'] || 0,
              goLiveDate: new Date(row['Go Live Date']),
              monthlyData: monthlyData
            };
          });
          
          resolve(processData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  }
  
  private getHeaders(worksheet: XLSX.WorkSheet): string[] {
    const headers: string[] = [];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
      headers.push(cell?.v || '');
    }
    
    return headers;
  }
  
  private identifyMonthColumns(headers: string[]): string[] {
    // Find columns that match the pattern like "jan-23", "feb-24", etc.
    const monthRegex = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{2}$/i;
    return headers.filter(header => monthRegex.test(header));
  }
  
  private parseMonthYearHeader(header: string): { month: number, year: number } {
    // Parse headers like "jan-24" into month and year
    const parts = header.toLowerCase().split('-');
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    const month = monthNames.indexOf(parts[0]) + 1; // 1-12
    const year = 2000 + parseInt(parts[1], 10); // Convert "24" to 2024
    
    return { month, year };
  }
}
