import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentfeedbackComponent } from './studentfeedback.component';

describe('StudentfeedbackComponent', () => {
  let component: StudentfeedbackComponent;
  let fixture: ComponentFixture<StudentfeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentfeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentfeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
