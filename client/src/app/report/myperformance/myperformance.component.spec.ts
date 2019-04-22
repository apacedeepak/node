import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyperformanceComponent } from './myperformance.component';

describe('MyperformanceComponent', () => {
  let component: MyperformanceComponent;
  let fixture: ComponentFixture<MyperformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyperformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyperformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
