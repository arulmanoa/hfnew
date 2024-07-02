import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerquisitesModalComponent } from './perquisites-modal.component';

describe('PerquisitesModalComponent', () => {
  let component: PerquisitesModalComponent;
  let fixture: ComponentFixture<PerquisitesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerquisitesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerquisitesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
