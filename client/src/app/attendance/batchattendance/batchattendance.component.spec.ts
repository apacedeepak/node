import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchattendanceComponent } from './batchattendance.component';

describe('BatchattendanceComponent', () => {
  let component: BatchattendanceComponent;
  let fixture: ComponentFixture<BatchattendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchattendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchattendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
