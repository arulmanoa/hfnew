import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityModelComponent } from './city-model.component';

describe('CityModelComponent', () => {
  let component: CityModelComponent;
  let fixture: ComponentFixture<CityModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
