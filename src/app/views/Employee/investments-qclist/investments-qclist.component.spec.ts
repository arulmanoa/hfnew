import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentsQclistComponent } from './investments-qclist.component';

describe('InvestmentsQclistComponent', () => {
  let component: InvestmentsQclistComponent;
  let fixture: ComponentFixture<InvestmentsQclistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentsQclistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentsQclistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
