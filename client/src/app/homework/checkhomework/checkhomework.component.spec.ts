import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckhomeworkComponent } from './checkhomework.component';

describe('CheckhomeworkComponent', () => {
  let component: CheckhomeworkComponent;
  let fixture: ComponentFixture<CheckhomeworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckhomeworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckhomeworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
