import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationAlertModalComponent } from './confirmation-alert-modal.component';

describe('ConfirmationAlertModalComponent', () => {
  let component: ConfirmationAlertModalComponent;
  let fixture: ComponentFixture<ConfirmationAlertModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationAlertModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationAlertModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
