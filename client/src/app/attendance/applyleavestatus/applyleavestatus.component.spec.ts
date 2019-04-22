import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyleavestatusComponent } from './applyleavestatus.component';

describe('ApplyleavestatusComponent', () => {
  let component: ApplyleavestatusComponent;
  let fixture: ComponentFixture<ApplyleavestatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyleavestatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyleavestatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
