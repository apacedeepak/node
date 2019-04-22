import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklytestperformanceComponent } from './weeklytestperformance.component';

describe('WeeklytestperformanceComponent', () => {
  let component: WeeklytestperformanceComponent;
  let fixture: ComponentFixture<WeeklytestperformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeeklytestperformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklytestperformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
