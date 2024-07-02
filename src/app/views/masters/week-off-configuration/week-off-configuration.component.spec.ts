import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekOffConfigurationComponent } from './week-off-configuration.component';

describe('WeekOffConfigurationComponent', () => {
  let component: WeekOffConfigurationComponent;
  let fixture: ComponentFixture<WeekOffConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekOffConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekOffConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
