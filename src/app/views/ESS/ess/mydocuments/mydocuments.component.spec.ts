import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MydocumentsComponent } from './mydocuments.component';

describe('MydocumentsComponent', () => {
  let component: MydocumentsComponent;
  let fixture: ComponentFixture<MydocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MydocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MydocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
