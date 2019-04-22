import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentviaregistrationComponent } from './paymentviaregistration.component';

describe('PaymentviaregistrationComponent', () => {
  let component: PaymentviaregistrationComponent;
  let fixture: ComponentFixture<PaymentviaregistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentviaregistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentviaregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
