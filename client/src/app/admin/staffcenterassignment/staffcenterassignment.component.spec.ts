import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffcenterassignmentComponent } from './staffcenterassignment.component';

describe('StaffcenterassignmentComponent', () => {
  let component: StaffcenterassignmentComponent;
  let fixture: ComponentFixture<StaffcenterassignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffcenterassignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffcenterassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
