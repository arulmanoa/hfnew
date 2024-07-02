import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatuatoryModalComponent } from './statuatory-modal.component';

describe('StatuatoryModalComponent', () => {
  let component: StatuatoryModalComponent;
  let fixture: ComponentFixture<StatuatoryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatuatoryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatuatoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
