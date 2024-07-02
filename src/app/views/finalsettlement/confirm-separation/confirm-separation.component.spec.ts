import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSeparationComponent } from './confirm-separation.component';

describe('ConfirmSeparationComponent', () => {
  let component: ConfirmSeparationComponent;
  let fixture: ComponentFixture<ConfirmSeparationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmSeparationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmSeparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
