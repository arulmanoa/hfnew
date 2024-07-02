import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerleaverequestComponent } from './managerleaverequest.component';

describe('ManagerleaverequestComponent', () => {
  let component: ManagerleaverequestComponent;
  let fixture: ComponentFixture<ManagerleaverequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerleaverequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerleaverequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
