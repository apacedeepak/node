import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatehomeworkComponent } from './createhomework.component';

describe('CreatehomeworkComponent', () => {
  let component: CreatehomeworkComponent;
  let fixture: ComponentFixture<CreatehomeworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatehomeworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatehomeworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
