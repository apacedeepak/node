import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchPlanningComponent } from './batch-planning.component';

describe('BatchPlanningComponent', () => {
  let component: BatchPlanningComponent;
  let fixture: ComponentFixture<BatchPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchPlanningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
