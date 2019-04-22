import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectwiseperformanceComponent } from './subjectwiseperformance.component';

describe('SubjectwiseperformanceComponent', () => {
  let component: SubjectwiseperformanceComponent;
  let fixture: ComponentFixture<SubjectwiseperformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubjectwiseperformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectwiseperformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
