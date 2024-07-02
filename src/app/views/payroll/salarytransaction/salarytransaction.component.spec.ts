import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarytransactionComponent } from './salarytransaction.component';

describe('SalarytransactionComponent', () => {
  let component: SalarytransactionComponent;
  let fixture: ComponentFixture<SalarytransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalarytransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarytransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
