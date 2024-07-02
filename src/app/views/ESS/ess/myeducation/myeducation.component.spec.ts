import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyeducationComponent } from './myeducation.component';

describe('MyeducationComponent', () => {
  let component: MyeducationComponent;
  let fixture: ComponentFixture<MyeducationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyeducationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyeducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
