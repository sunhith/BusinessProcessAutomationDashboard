// src/app/core/strategies/data-source.strategy.ts
import { ProcessData } from '../../shared/models/process-data.model';

export interface DataSourceStrategy {
  loadData(source: any): Promise<ProcessData[]>;
}
