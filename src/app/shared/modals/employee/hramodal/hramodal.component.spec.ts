import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HramodalComponent } from './hramodal.component';

describe('HramodalComponent', () => {
  let component: HramodalComponent;
  let fixture: ComponentFixture<HramodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HramodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HramodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
