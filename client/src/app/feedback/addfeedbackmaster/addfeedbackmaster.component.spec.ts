import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddfeedbackmasterComponent } from './addfeedbackmaster.component';

describe('AddfeedbackmasterComponent', () => {
  let component: AddfeedbackmasterComponent;
  let fixture: ComponentFixture<AddfeedbackmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddfeedbackmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddfeedbackmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
