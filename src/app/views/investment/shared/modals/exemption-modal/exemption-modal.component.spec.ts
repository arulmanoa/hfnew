import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionModalComponent } from './exemption-modal.component';

describe('ExemptionModalComponent', () => {
  let component: ExemptionModalComponent;
  let fixture: ComponentFixture<ExemptionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExemptionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExemptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
