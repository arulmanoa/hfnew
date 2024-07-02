import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommaSeparatedStringsFilterComponent } from './comma-separated-strings-filter.component';

describe('CommaSeparatedStringsFilterComponent', () => {
  let component: CommaSeparatedStringsFilterComponent;
  let fixture: ComponentFixture<CommaSeparatedStringsFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommaSeparatedStringsFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommaSeparatedStringsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
