import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestapprovalComponent } from './requestapproval.component';

describe('RequestapprovalComponent', () => {
  let component: RequestapprovalComponent;
  let fixture: ComponentFixture<RequestapprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestapprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestapprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
