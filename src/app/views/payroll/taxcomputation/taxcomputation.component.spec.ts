import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxcomputationComponent } from './taxcomputation.component';

describe('TaxcomputationComponent', () => {
  let component: TaxcomputationComponent;
  let fixture: ComponentFixture<TaxcomputationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxcomputationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxcomputationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
