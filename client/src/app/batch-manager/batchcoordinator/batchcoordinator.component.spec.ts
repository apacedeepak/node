import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchcoordinatorComponent } from './batchcoordinator.component';

describe('BatchcoordinatorComponent', () => {
  let component: BatchcoordinatorComponent;
  let fixture: ComponentFixture<BatchcoordinatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchcoordinatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchcoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
