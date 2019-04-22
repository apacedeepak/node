import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaulterComponent } from './defaulter.component';

describe('DefaulterComponent', () => {
  let component: DefaulterComponent;
  let fixture: ComponentFixture<DefaulterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaulterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaulterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
