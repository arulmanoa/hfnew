import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessuiComponent } from './successui.component';

describe('SuccessuiComponent', () => {
  let component: SuccessuiComponent;
  let fixture: ComponentFixture<SuccessuiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessuiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
