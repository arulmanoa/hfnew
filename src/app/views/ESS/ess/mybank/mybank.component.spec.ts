import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MybankComponent } from './mybank.component';

describe('MybankComponent', () => {
  let component: MybankComponent;
  let fixture: ComponentFixture<MybankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MybankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MybankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
