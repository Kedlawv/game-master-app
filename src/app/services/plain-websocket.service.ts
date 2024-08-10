import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlainWebSocketService {
  private socket?: WebSocket;
  private newPlayerObserver?: Observer<any>;
  private playerScoreObserver?: Observer<any>;
  private reconnectInterval = 5000; // 5 seconds
  private reconnectAttempts = 0;

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = new WebSocket('ws://localhost:8080');
    this.setupListeners();
  }

  private setupListeners(): void {
    if (this.socket == null) {return;}

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server.");
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      this.sendIdentification({ type: "GameMaster", id: `game-master-${this.socket?.url}` });
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case 'new-player':
          if (this.newPlayerObserver) {
            this.newPlayerObserver.next(data);
          }
          break;
        case 'player-score':
          if (this.playerScoreObserver) {
            this.playerScoreObserver.next(data);
          }
          break;
        case 'start-game':
          console.log("Received start-game event");
          break;
        default:
          console.log("Unknown event type:", type);
          break;
      }
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WebSocket server.");
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
        this.socket?.close();
    };
  }

  private reconnect(): void {
    if (this.reconnectAttempts < 10) {
      console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error("Max reconnect attempts reached. Please check the server.");
    }
  }

  sendMessage(eventType: string, msg: string) {
    this.socket?.send(JSON.stringify({ type: eventType, data: msg }));
  }

  sendIdentification(data: object) {
    console.log("Sending identification" + JSON.stringify(data));
    this.sendMessage("identify", JSON.stringify(data));
  }

  onNewPlayer(): Observable<any> {
    return new Observable(observer => {
      this.newPlayerObserver = observer;
    });
  }

  onPlayerScore(): Observable<any> {
    return new Observable(observer => {
      this.playerScoreObserver = observer;
    });
  }

  sendAcknowledgment(msg: string) {
    this.sendMessage('acknowledge', msg);
  }
}
