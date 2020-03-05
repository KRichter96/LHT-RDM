import { TestBed } from '@angular/core/testing';

import { StorageHelperService } from './storage-helper.service';

describe('StorageHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StorageHelperService = TestBed.get(StorageHelperService);
    expect(service).toBeTruthy();
  });
});
