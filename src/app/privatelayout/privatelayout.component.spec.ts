import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatelayoutComponent } from './privatelayout.component';

describe('PrivatelayoutComponent', () => {
  let component: PrivatelayoutComponent;
  let fixture: ComponentFixture<PrivatelayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivatelayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatelayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
