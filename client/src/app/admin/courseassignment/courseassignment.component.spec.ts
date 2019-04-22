import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseassignmentComponent } from './courseassignment.component';

describe('CourseassignmentComponent', () => {
  let component: CourseassignmentComponent;
  let fixture: ComponentFixture<CourseassignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseassignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
