import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonlayoutComponent } from './commonlayout.component';

describe('CommonlayoutComponent', () => {
  let component: CommonlayoutComponent;
  let fixture: ComponentFixture<CommonlayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonlayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonlayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
