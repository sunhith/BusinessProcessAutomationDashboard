// src/app/dashboard/components/filter/filter.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @Output() searchChanged = new EventEmitter<string>();
  @Output() businessUnitChanged = new EventEmitter<string>();
  
  searchControl = new FormControl('');
  businessUnitControl = new FormControl('');
  businessUnits: string[] = [];
  
  constructor(private dataService: DataService) {
    this.searchControl.valueChanges.subscribe(value => {
      this.searchChanged.emit(value || '');
    });
    
    this.businessUnitControl.valueChanges.subscribe(value => {
      this.businessUnitChanged.emit(value || '');
    });
  }
  
  ngOnInit(): void {
    this.dataService.processDataObservable.subscribe(() => {
      // Update business units when data changes
      this.businessUnits = this.dataService.getUniqueBusinessUnits();
    });
  }
  
  clearFilters(): void {
    this.searchControl.setValue('');
    this.businessUnitControl.setValue('');
  }
}
