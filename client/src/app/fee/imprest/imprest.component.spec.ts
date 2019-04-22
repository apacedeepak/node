import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprestComponent } from './imprest.component';

describe('ImprestComponent', () => {
  let component: ImprestComponent;
  let fixture: ComponentFixture<ImprestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImprestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
