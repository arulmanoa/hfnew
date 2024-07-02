import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureInputsModalComponent } from './configure-inputs-modal.component';

describe('ConfigureInputsModalComponent', () => {
  let component: ConfigureInputsModalComponent;
  let fixture: ComponentFixture<ConfigureInputsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureInputsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureInputsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
