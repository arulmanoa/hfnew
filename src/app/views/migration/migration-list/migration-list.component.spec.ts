import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationListComponent } from './migration-list.component';

describe('MigrationListComponent', () => {
  let component: MigrationListComponent;
  let fixture: ComponentFixture<MigrationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigrationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
