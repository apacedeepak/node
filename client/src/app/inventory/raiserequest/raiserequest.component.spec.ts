import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiserequestComponent } from './raiserequest.component';

describe('RaiserequestComponent', () => {
  let component: RaiserequestComponent;
  let fixture: ComponentFixture<RaiserequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaiserequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiserequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
