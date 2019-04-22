import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentwisemarkentryComponent } from './studentwisemarkentry.component';

describe('StudentwisemarkentryComponent', () => {
  let component: StudentwisemarkentryComponent;
  let fixture: ComponentFixture<StudentwisemarkentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentwisemarkentryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentwisemarkentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
