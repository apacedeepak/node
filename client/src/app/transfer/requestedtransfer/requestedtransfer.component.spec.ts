import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestedtransferComponent } from './requestedtransfer.component';

describe('RequestedtransferComponent', () => {
  let component: RequestedtransferComponent;
  let fixture: ComponentFixture<RequestedtransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestedtransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestedtransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
