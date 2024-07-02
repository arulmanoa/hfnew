import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutFinanceModalComponent } from './payout-finance-modal.component';

describe('PayoutFinanceModalComponent', () => {
  let component: PayoutFinanceModalComponent;
  let fixture: ComponentFixture<PayoutFinanceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutFinanceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutFinanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
