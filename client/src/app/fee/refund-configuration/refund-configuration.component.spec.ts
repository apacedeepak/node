import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundConfigurationComponent } from './refund-configuration.component';

describe('RefundConfigurationComponent', () => {
  let component: RefundConfigurationComponent;
  let fixture: ComponentFixture<RefundConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
