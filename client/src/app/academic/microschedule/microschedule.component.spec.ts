import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroscheduleComponent } from './microschedule.component';

describe('MicroscheduleComponent', () => {
  let component: MicroscheduleComponent;
  let fixture: ComponentFixture<MicroscheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicroscheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicroscheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
