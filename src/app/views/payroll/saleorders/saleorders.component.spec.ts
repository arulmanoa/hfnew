import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleordersComponent } from './saleorders.component';

describe('SaleordersComponent', () => {
  let component: SaleordersComponent;
  let fixture: ComponentFixture<SaleordersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleordersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
