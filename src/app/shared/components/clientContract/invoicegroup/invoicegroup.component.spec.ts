import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicegroupComponent } from './invoicegroup.component';

describe('InvoicegroupComponent', () => {
  let component: InvoicegroupComponent;
  let fixture: ComponentFixture<InvoicegroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicegroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicegroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
