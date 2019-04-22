import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeheadComponent } from './feehead.component';

describe('FeeheadComponent', () => {
  let component: FeeheadComponent;
  let fixture: ComponentFixture<FeeheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeeheadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
