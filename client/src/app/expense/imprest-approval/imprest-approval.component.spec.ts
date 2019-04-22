import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprestApprovalComponent } from './imprest-approval.component';

describe('ImprestApprovalComponent', () => {
  let component: ImprestApprovalComponent;
  let fixture: ComponentFixture<ImprestApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImprestApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprestApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
