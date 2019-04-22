import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserfeedbackfrequencyComponent } from './userfeedbackfrequency.component';

describe('UserfeedbackfrequencyComponent', () => {
  let component: UserfeedbackfrequencyComponent;
  let fixture: ComponentFixture<UserfeedbackfrequencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserfeedbackfrequencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserfeedbackfrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
