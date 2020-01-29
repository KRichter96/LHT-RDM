import { TestBed } from '@angular/core/testing';

import { BackendUrlProviderService } from './backend-url-provider.service';

describe('BackendUrlProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackendUrlProviderService = TestBed.get(BackendUrlProviderService);
    expect(service).toBeTruthy();
  });
});
