import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorPaymentApprovalComponent } from './vendor-payment-approval.component';

describe('VendorPaymentApprovalComponent', () => {
  let component: VendorPaymentApprovalComponent;
  let fixture: ComponentFixture<VendorPaymentApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorPaymentApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorPaymentApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
