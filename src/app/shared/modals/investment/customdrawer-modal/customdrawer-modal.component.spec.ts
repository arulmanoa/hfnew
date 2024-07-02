import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomdrawerModalComponent } from './customdrawer-modal.component';

describe('CustomdrawerModalComponent', () => {
  let component: CustomdrawerModalComponent;
  let fixture: ComponentFixture<CustomdrawerModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomdrawerModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomdrawerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
