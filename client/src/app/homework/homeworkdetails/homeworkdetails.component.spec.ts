import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeworkdetailsComponent } from './homeworkdetails.component';

describe('HomeworkdetailsComponent', () => {
  let component: HomeworkdetailsComponent;
  let fixture: ComponentFixture<HomeworkdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeworkdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeworkdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
