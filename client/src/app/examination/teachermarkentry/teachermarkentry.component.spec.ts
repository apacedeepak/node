import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachermarkentryComponent } from './teachermarkentry.component';

describe('TeachermarkentryComponent', () => {
  let component: TeachermarkentryComponent;
  let fixture: ComponentFixture<TeachermarkentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeachermarkentryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachermarkentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
