import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaybreakupdetailsComponent } from './salaybreakupdetails.component';

describe('SalaybreakupdetailsComponent', () => {
  let component: SalaybreakupdetailsComponent;
  let fixture: ComponentFixture<SalaybreakupdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalaybreakupdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaybreakupdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
