import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddtermComponent } from './addterm.component';

describe('AddtermComponent', () => {
  let component: AddtermComponent;
  let fixture: ComponentFixture<AddtermComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddtermComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddtermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
