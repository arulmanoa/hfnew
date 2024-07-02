import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutViewrequestModalComponent } from './payout-viewrequest-modal.component';

describe('PayoutViewrequestModalComponent', () => {
  let component: PayoutViewrequestModalComponent;
  let fixture: ComponentFixture<PayoutViewrequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutViewrequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutViewrequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
