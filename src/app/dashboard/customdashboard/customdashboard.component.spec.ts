import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomdashboardComponent } from './customdashboard.component';

describe('CustomdashboardComponent', () => {
  let component: CustomdashboardComponent;
  let fixture: ComponentFixture<CustomdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
