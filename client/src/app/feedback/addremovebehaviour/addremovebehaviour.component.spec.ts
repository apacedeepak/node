import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddremovebehaviourComponent } from './addremovebehaviour.component';

describe('AddremovebehaviourComponent', () => {
  let component: AddremovebehaviourComponent;
  let fixture: ComponentFixture<AddremovebehaviourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddremovebehaviourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddremovebehaviourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
