import { TestBed } from '@angular/core/testing';

import { PlainWebsocketService } from './plain-websocket.service';

describe('PlainWebsocketService', () => {
  let service: PlainWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlainWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
