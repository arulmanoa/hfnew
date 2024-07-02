import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureInputsComponent } from './configure-inputs.component';

describe('ConfigureInputsComponent', () => {
  let component: ConfigureInputsComponent;
  let fixture: ComponentFixture<ConfigureInputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
