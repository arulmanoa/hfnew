import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MycontractwizardComponent } from './mycontractwizard.component';

describe('MycontractwizardComponent', () => {
  let component: MycontractwizardComponent;
  let fixture: ComponentFixture<MycontractwizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MycontractwizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MycontractwizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
