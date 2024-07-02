import { TestBed } from '@angular/core/testing';

import { DynamicuiService } from './dynamicui.service';

describe('DynamicuiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicuiService = TestBed.get(DynamicuiService);
    expect(service).toBeTruthy();
  });
});
