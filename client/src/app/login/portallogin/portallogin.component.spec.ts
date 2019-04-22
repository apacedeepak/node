import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalloginComponent } from './portallogin.component';

describe('PortalloginComponent', () => {
  let component: PortalloginComponent;
  let fixture: ComponentFixture<PortalloginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortalloginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
