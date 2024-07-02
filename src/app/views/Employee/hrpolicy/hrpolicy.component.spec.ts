import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HrpolicyComponent } from './hrpolicy.component';

describe('HrpolicyComponent', () => {
  let component: HrpolicyComponent;
  let fixture: ComponentFixture<HrpolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HrpolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HrpolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
