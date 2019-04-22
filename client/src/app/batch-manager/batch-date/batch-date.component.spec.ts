import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchDateComponent } from './batch-date.component';

describe('BatchDateComponent', () => {
  let component: BatchDateComponent;
  let fixture: ComponentFixture<BatchDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
