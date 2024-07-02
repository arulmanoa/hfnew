import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftMappingComponent } from './shift-mapping.component';

describe('ShiftMappingComponent', () => {
  let component: ShiftMappingComponent;
  let fixture: ComponentFixture<ShiftMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
