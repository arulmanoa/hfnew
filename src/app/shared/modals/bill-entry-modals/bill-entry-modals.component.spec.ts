import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillEntryModalsComponent } from './bill-entry-modals.component';

describe('BillEntryModalsComponent', () => {
  let component: BillEntryModalsComponent;
  let fixture: ComponentFixture<BillEntryModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillEntryModalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillEntryModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
