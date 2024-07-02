import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherincomeModalComponent } from './otherincome-modal.component';

describe('OtherincomeModalComponent', () => {
  let component: OtherincomeModalComponent;
  let fixture: ComponentFixture<OtherincomeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherincomeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherincomeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
