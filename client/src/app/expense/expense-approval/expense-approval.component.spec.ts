import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseApprovalComponent } from './expense-approval.component';

describe('ExpenseApprovalComponent', () => {
  let component: ExpenseApprovalComponent;
  let fixture: ComponentFixture<ExpenseApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
