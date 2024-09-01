import { TestBed } from '@angular/core/testing';

import { PlainWebSocketService } from './plain-websocket.service';

describe('PlainWebsocketService', () => {
  let service: PlainWebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlainWebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
