import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuassignmentComponent } from './menuassignment.component';

describe('MenuassignmentComponent', () => {
  let component: MenuassignmentComponent;
  let fixture: ComponentFixture<MenuassignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuassignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
