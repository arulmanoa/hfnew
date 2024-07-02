import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossfromhousepropModalComponent } from './lossfromhouseprop-modal.component';

describe('LossfromhousepropModalComponent', () => {
  let component: LossfromhousepropModalComponent;
  let fixture: ComponentFixture<LossfromhousepropModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossfromhousepropModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossfromhousepropModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
