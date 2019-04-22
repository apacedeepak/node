import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsearchComponent } from './studentsearch.component';

describe('StudentsearchComponent', () => {
  let component: StudentsearchComponent;
  let fixture: ComponentFixture<StudentsearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
