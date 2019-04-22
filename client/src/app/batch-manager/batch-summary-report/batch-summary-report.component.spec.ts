import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchSummaryReportComponent } from './batch-summary-report.component';

describe('BatchSummaryReportComponent', () => {
  let component: BatchSummaryReportComponent;
  let fixture: ComponentFixture<BatchSummaryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchSummaryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
