import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardtransferComponent } from './forwardtransfer.component';

describe('ForwardtransferComponent', () => {
  let component: ForwardtransferComponent;
  let fixture: ComponentFixture<ForwardtransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForwardtransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwardtransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
