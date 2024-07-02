import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductApplicabilityComponent } from './product-applicability.component';

describe('ProductApplicabilityComponent', () => {
  let component: ProductApplicabilityComponent;
  let fixture: ComponentFixture<ProductApplicabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductApplicabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductApplicabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
