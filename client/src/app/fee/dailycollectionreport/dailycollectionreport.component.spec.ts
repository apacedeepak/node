import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailycollectionreportComponent } from './dailycollectionreport.component';

describe('DailycollectionreportComponent', () => {
  let component: DailycollectionreportComponent;
  let fixture: ComponentFixture<DailycollectionreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailycollectionreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailycollectionreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
