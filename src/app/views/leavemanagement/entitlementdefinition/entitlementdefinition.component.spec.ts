import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitlementdefinitionComponent } from './entitlementdefinition.component';

describe('EntitlementdefinitionComponent', () => {
  let component: EntitlementdefinitionComponent;
  let fixture: ComponentFixture<EntitlementdefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitlementdefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitlementdefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
