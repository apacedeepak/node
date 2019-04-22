import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentmasterComponent } from './equipmentmaster.component';

describe('EquipmentmasterComponent', () => {
  let component: EquipmentmasterComponent;
  let fixture: ComponentFixture<EquipmentmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
