import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassmasterComponent } from './classmaster.component';

describe('ClassmasterComponent', () => {
  let component: ClassmasterComponent;
  let fixture: ComponentFixture<ClassmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
