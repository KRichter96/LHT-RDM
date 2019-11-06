import { TestBed } from '@angular/core/testing';

import { ProjectrepositoryService } from './projectrepository.service';

describe('ProjectrepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectrepositoryService = TestBed.get(ProjectrepositoryService);
    expect(service).toBeTruthy();
  });
});
