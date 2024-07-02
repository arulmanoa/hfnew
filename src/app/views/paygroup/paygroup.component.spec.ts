import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaygroupComponent } from './paygroup.component';

describe('PaygroupComponent', () => {
  let component: PaygroupComponent;
  let fixture: ComponentFixture<PaygroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaygroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaygroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
