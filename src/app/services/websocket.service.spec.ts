import { TestBed } from '@angular/core/testing';

import { OldWebsocketService } from './old.websocket.service';

describe('WebsocketService', () => {
  let service: OldWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OldWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
