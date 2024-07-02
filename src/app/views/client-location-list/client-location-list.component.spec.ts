import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientLocationListComponent } from './client-location-list.component';

describe('ClientLocationListComponent', () => {
  let component: ClientLocationListComponent;
  let fixture: ComponentFixture<ClientLocationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientLocationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
