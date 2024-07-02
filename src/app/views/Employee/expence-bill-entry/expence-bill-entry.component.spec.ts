import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenceBillEntryComponent } from './expence-bill-entry.component';

describe('ExpenceBillEntryComponent', () => {
  let component: ExpenceBillEntryComponent;
  let fixture: ComponentFixture<ExpenceBillEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenceBillEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenceBillEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
