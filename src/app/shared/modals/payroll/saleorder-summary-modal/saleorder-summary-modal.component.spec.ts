import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleorderSummaryModalComponent } from './saleorder-summary-modal.component';

describe('SaleorderSummaryModalComponent', () => {
  let component: SaleorderSummaryModalComponent;
  let fixture: ComponentFixture<SaleorderSummaryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleorderSummaryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleorderSummaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
