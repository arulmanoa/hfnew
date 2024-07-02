import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendoronboardingListComponent } from './vendoronboarding-list.component';

describe('VendoronboardingListComponent', () => {
  let component: VendoronboardingListComponent;
  let fixture: ComponentFixture<VendoronboardingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendoronboardingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendoronboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
