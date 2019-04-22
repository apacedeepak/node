import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementApprovalComponent } from './reimbursement-approval.component';

describe('ReimbursementApprovalComponent', () => {
  let component: ReimbursementApprovalComponent;
  let fixture: ComponentFixture<ReimbursementApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReimbursementApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReimbursementApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
