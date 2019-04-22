import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectwisemarkentryComponent } from './subjectwisemarkentry.component';

describe('SubjectwisemarkentryComponent', () => {
  let component: SubjectwisemarkentryComponent;
  let fixture: ComponentFixture<SubjectwisemarkentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubjectwisemarkentryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectwisemarkentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
