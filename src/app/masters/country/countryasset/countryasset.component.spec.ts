import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountrymanagerComponent } from './countryasset.component';

describe('CountrymanagerComponent', () => {
  let component: CountrymanagerComponent;
  let fixture: ComponentFixture<CountrymanagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountrymanagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountrymanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
