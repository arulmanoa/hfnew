import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MycommunicationsComponent } from './mycommunications.component';

describe('MycommunicationsComponent', () => {
  let component: MycommunicationsComponent;
  let fixture: ComponentFixture<MycommunicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MycommunicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MycommunicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
