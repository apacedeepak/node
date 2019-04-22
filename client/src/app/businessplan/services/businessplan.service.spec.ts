import { TestBed } from '@angular/core/testing';

import { BusinessplanService } from './businessplan.service';

describe('BusinessplanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BusinessplanService = TestBed.get(BusinessplanService);
    expect(service).toBeTruthy();
  });
});
