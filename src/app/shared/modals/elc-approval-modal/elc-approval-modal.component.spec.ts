import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElcApprovalModalComponent } from './elc-approval-modal.component';

describe('ElcApprovalModalComponent', () => {
  let component: ElcApprovalModalComponent;
  let fixture: ComponentFixture<ElcApprovalModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElcApprovalModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElcApprovalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
