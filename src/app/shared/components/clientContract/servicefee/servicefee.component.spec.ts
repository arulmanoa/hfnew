import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicefeeComponent } from './servicefee.component';

describe('ServicefeeComponent', () => {
  let component: ServicefeeComponent;
  let fixture: ComponentFixture<ServicefeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicefeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicefeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
