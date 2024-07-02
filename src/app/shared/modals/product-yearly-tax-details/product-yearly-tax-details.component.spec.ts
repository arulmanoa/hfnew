import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductYearlyTaxDetailsComponent } from './product-yearly-tax-details.component';

describe('ProductYearlyTaxDetailsComponent', () => {
  let component: ProductYearlyTaxDetailsComponent;
  let fixture: ComponentFixture<ProductYearlyTaxDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductYearlyTaxDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductYearlyTaxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
