import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueTargetComponent } from './revenue-target.component';

describe('RevenueTargetComponent', () => {
  let component: RevenueTargetComponent;
  let fixture: ComponentFixture<RevenueTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevenueTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
