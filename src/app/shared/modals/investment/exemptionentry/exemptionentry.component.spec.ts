import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionentryComponent } from './exemptionentry.component';

describe('ExemptionentryComponent', () => {
  let component: ExemptionentryComponent;
  let fixture: ComponentFixture<ExemptionentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExemptionentryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExemptionentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
