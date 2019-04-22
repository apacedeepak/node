import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyhomeworkComponent } from './replyhomework.component';

describe('ReplyhomeworkComponent', () => {
  let component: ReplyhomeworkComponent;
  let fixture: ComponentFixture<ReplyhomeworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplyhomeworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyhomeworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
