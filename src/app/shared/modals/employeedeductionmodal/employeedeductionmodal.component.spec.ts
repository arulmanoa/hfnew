import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedeductionmodalComponent } from './employeedeductionmodal.component';

describe('EmployeedeductionmodalComponent', () => {
  let component: EmployeedeductionmodalComponent;
  let fixture: ComponentFixture<EmployeedeductionmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeedeductionmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeedeductionmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
