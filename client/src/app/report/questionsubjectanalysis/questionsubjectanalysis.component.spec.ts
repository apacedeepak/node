import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsubjectanalysisComponent } from './questionsubjectanalysis.component';

describe('QuestionsubjectanalysisComponent', () => {
  let component: QuestionsubjectanalysisComponent;
  let fixture: ComponentFixture<QuestionsubjectanalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsubjectanalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsubjectanalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
