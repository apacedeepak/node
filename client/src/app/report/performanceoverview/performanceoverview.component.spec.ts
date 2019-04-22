import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceoverviewComponent } from './performanceoverview.component';

describe('PerformanceoverviewComponent', () => {
  let component: PerformanceoverviewComponent;
  let fixture: ComponentFixture<PerformanceoverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceoverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
