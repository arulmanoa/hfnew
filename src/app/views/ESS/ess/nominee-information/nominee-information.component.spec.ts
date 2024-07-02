import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NomineeInformationComponent } from './nominee-information.component';

describe('NomineeInformationComponent', () => {
  let component: NomineeInformationComponent;
  let fixture: ComponentFixture<NomineeInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NomineeInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NomineeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
