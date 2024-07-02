import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MypaymentsComponent } from './mypayments.component';

describe('MypaymentsComponent', () => {
  let component: MypaymentsComponent;
  let fixture: ComponentFixture<MypaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MypaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MypaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
