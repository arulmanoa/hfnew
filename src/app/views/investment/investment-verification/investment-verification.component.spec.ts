import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentVerificationComponent } from './investment-verification.component';

describe('InvestmentVerificationComponent', () => {
  let component: InvestmentVerificationComponent;
  let fixture: ComponentFixture<InvestmentVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
