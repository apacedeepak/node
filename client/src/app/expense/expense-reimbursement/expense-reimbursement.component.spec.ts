import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseReimbursementComponent } from './expense-reimbursement.component';

describe('ExpenseReimbursementComponent', () => {
  let component: ExpenseReimbursementComponent;
  let fixture: ComponentFixture<ExpenseReimbursementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseReimbursementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseReimbursementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
