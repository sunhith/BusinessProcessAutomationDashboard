// src/app/core/models/process-data.model.ts
export interface ProcessData {
    businessUnit: string;
    processName: string;
    minItems: number;
    goLiveDate: Date;
    monthlyData: MonthlyDataPoint[];
  }
  
  export interface MonthlyDataPoint {
    year: number;
    month: number; // 1-12 for Jan-Dec
    value: number;
  }
  
  export interface ProcessSummary {
    totalProcesses: number;
    totalBusinessUnits: number;
    averageMinItems: number;
    totalProcessedItems: number;
    monthlyTotals: { month: number; year: number; value: number }[];
  }
  