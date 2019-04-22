import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsagetrackerComponent } from './usagetracker.component';

describe('UsagetrackerComponent', () => {
  let component: UsagetrackerComponent;
  let fixture: ComponentFixture<UsagetrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsagetrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagetrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
