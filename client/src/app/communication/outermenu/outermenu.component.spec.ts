import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutermenuComponent } from './outermenu.component';

describe('OutermenuComponent', () => {
  let component: OutermenuComponent;
  let fixture: ComponentFixture<OutermenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutermenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutermenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
