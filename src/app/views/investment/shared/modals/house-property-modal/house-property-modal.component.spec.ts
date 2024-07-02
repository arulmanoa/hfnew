import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HousePropertyModalComponent } from './house-property-modal.component';

describe('HousePropertyModalComponent', () => {
  let component: HousePropertyModalComponent;
  let fixture: ComponentFixture<HousePropertyModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HousePropertyModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HousePropertyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
