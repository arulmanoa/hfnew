import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizeleaverequestModalComponent } from './regularizeleaverequest-modal.component';

describe('RegularizeleaverequestModalComponent', () => {
  let component: RegularizeleaverequestModalComponent;
  let fixture: ComponentFixture<RegularizeleaverequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegularizeleaverequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegularizeleaverequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
