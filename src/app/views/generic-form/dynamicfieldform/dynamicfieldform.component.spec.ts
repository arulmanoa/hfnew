import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicfieldformComponent } from './dynamicfieldform.component';

describe('DynamicfieldformComponent', () => {
  let component: DynamicfieldformComponent;
  let fixture: ComponentFixture<DynamicfieldformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicfieldformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicfieldformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
