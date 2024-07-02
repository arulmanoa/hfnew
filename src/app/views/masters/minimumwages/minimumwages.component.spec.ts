import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimumwagesComponent } from './minimumwages.component';

describe('MinimumwagesComponent', () => {
  let component: MinimumwagesComponent;
  let fixture: ComponentFixture<MinimumwagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimumwagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinimumwagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
