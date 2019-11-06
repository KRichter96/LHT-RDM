import { TestBed } from '@angular/core/testing';
import { ServerRepositoryService } from './serverrepository.service';

describe('ProjectrepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServerRepositoryService = TestBed.get(ServerRepositoryService);
    expect(service).toBeTruthy();
  });
});
