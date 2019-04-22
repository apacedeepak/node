import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMigrationComponent } from './student-migration.component';

describe('StudentMigrationComponent', () => {
  let component: StudentMigrationComponent;
  let fixture: ComponentFixture<StudentMigrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentMigrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
