import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FnftransactionComponent } from './fnftransaction.component';

describe('FnftransactionComponent', () => {
  let component: FnftransactionComponent;
  let fixture: ComponentFixture<FnftransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FnftransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FnftransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
