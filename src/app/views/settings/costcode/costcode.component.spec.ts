import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostcodeComponent } from './costcode.component';

describe('CostcodeComponent', () => {
  let component: CostcodeComponent;
  let fixture: ComponentFixture<CostcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
