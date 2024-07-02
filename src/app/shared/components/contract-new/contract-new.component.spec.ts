import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewContractComponent } from './contract-new.component';

describe('ContractNewComponent', () => {
  let component: NewContractComponent;
  let fixture: ComponentFixture<NewContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
