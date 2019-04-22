import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemarkhomeworkComponent } from './remarkhomework.component';

describe('RemarkhomeworkComponent', () => {
  let component: RemarkhomeworkComponent;
  let fixture: ComponentFixture<RemarkhomeworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemarkhomeworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemarkhomeworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
