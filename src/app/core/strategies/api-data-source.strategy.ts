// src/app/core/strategies/api-data-source.strategy.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSourceStrategy } from './data-source.strategy';
import { ProcessData } from '../../shared/models/process-data.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiDataSourceStrategy implements DataSourceStrategy {
  constructor(private http: HttpClient) {}
  
  async loadData(url: string): Promise<ProcessData[]> {
    try {
      return await firstValueFrom(this.http.get<ProcessData[]>(url));
    } catch (error) {
      console.error('Error loading API data:', error);
      return [];
    }
  }
}
