import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionaloperationalinfoComponent } from './additionaloperationalinfo.component';

describe('AdditionaloperationalinfoComponent', () => {
  let component: AdditionaloperationalinfoComponent;
  let fixture: ComponentFixture<AdditionaloperationalinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionaloperationalinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionaloperationalinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
