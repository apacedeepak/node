import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommdetailComponent } from './commdetail.component';

describe('CommdetailComponent', () => {
  let component: CommdetailComponent;
  let fixture: ComponentFixture<CommdetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommdetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
