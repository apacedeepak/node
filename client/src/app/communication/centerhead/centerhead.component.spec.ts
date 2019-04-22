import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterheadComponent } from './centerhead.component';

describe('CenterheadComponent', () => {
  let component: CenterheadComponent;
  let fixture: ComponentFixture<CenterheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterheadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
