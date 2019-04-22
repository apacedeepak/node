import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueTargetAdminComponent } from './revenue-target-admin.component';

describe('RevenueTargetAdminComponent', () => {
  let component: RevenueTargetAdminComponent;
  let fixture: ComponentFixture<RevenueTargetAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevenueTargetAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueTargetAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
