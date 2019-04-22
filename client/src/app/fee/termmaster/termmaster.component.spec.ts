import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermmasterComponent } from './termmaster.component';

describe('TermmasterComponent', () => {
  let component: TermmasterComponent;
  let fixture: ComponentFixture<TermmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
