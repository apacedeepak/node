import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherhomeworkdraftComponent } from './teacherhomeworkdraft.component';

describe('TeacherhomeworkdraftComponent', () => {
  let component: TeacherhomeworkdraftComponent;
  let fixture: ComponentFixture<TeacherhomeworkdraftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherhomeworkdraftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherhomeworkdraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
