import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessChartComponent } from './process-chart.component';

describe('ProcessChartComponent', () => {
  let component: ProcessChartComponent;
  let fixture: ComponentFixture<ProcessChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
