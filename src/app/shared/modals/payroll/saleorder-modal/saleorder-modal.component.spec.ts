import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleorderModalComponent } from './saleorder-modal.component';

describe('SaleorderModalComponent', () => {
  let component: SaleorderModalComponent;
  let fixture: ComponentFixture<SaleorderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleorderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleorderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
