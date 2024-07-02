import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicdependentModalComponent } from './medicdependent-modal.component';

describe('MedicdependentModalComponent', () => {
  let component: MedicdependentModalComponent;
  let fixture: ComponentFixture<MedicdependentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicdependentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicdependentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
