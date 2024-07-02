import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomactionformatterComponent } from './customactionformatter.component';

describe('CustomactionformatterComponent', () => {
  let component: CustomactionformatterComponent;
  let fixture: ComponentFixture<CustomactionformatterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomactionformatterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomactionformatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
