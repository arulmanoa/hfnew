import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageinvestmentComponent } from './manageinvestment.component';

describe('ManageinvestmentComponent', () => {
  let component: ManageinvestmentComponent;
  let fixture: ComponentFixture<ManageinvestmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageinvestmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageinvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
