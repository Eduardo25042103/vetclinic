import { TestBed } from '@angular/core/testing';

import { VeterinarianProfileService } from './veterinarian-profile.service';

describe('VeterinarianProfileService', () => {
  let service: VeterinarianProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VeterinarianProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
