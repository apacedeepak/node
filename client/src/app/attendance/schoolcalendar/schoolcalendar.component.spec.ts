import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolcalendarComponent } from './schoolcalendar.component';

describe('SchoolcalendarComponent', () => {
  let component: SchoolcalendarComponent;
  let fixture: ComponentFixture<SchoolcalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolcalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolcalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
