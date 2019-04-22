import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursemodeComponent } from './coursemode.component';

describe('CoursemodeComponent', () => {
  let component: CoursemodeComponent;
  let fixture: ComponentFixture<CoursemodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursemodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursemodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
