import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterRoomComponent } from './center-room.component';

describe('CenterRoomComponent', () => {
  let component: CenterRoomComponent;
  let fixture: ComponentFixture<CenterRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
