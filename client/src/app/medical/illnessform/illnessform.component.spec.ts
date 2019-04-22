import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IllnessformComponent } from './illnessform.component';

describe('IllnessformComponent', () => {
  let component: IllnessformComponent;
  let fixture: ComponentFixture<IllnessformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IllnessformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
