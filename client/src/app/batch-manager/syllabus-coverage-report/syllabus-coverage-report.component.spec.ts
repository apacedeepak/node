import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyllabusCoverageReportComponent } from './syllabus-coverage-report.component';

describe('SyllabusCoverageReportComponent', () => {
  let component: SyllabusCoverageReportComponent;
  let fixture: ComponentFixture<SyllabusCoverageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyllabusCoverageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyllabusCoverageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
