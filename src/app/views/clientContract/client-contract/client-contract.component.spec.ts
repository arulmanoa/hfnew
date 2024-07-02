import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientContractComponent } from './client-contract.component';

describe('ClientContractComponent', () => {
  let component: ClientContractComponent;
  let fixture: ComponentFixture<ClientContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
