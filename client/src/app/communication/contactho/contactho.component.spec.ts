import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContacthoComponent } from './contactho.component';

describe('ContacthoComponent', () => {
  let component: ContacthoComponent;
  let fixture: ComponentFixture<ContacthoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContacthoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContacthoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
