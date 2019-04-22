import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundDropoutComponent } from './refund-dropout.component';

describe('RefundDropoutComponent', () => {
  let component: RefundDropoutComponent;
  let fixture: ComponentFixture<RefundDropoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundDropoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundDropoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
