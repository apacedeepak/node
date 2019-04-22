import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionwiseanalysisComponent } from './questionwiseanalysis.component';

describe('QuestionwiseanalysisComponent', () => {
  let component: QuestionwiseanalysisComponent;
  let fixture: ComponentFixture<QuestionwiseanalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionwiseanalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionwiseanalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
