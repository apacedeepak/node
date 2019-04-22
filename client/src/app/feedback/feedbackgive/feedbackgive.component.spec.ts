import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackgiveComponent } from './feedbackgive.component';

describe('FeedbackgiveComponent', () => {
  let component: FeedbackgiveComponent;
  let fixture: ComponentFixture<FeedbackgiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackgiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackgiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
