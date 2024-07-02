import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Genericimport2Component } from './genericimport2.component';

describe('Genericimport2Component', () => {
  let component: Genericimport2Component;
  let fixture: ComponentFixture<Genericimport2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Genericimport2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Genericimport2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
