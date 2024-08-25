import { Injectable } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlainWebSocketService {
  private socket?: WebSocket;
  private newPlayerObserver?: Observer<any>;
  private playerScoreObserver?: Observer<any>;
  private currentPlayersObserver?: Observer<any>;
  private reconnectAttempts = 0;
  private readonly maxAttempts = 10;
  private serverURL = 'ws://localhost:8080'

  // Create a BehaviorSubject with an initial state of 'disconnected'
  private connectionStatusSubject: BehaviorSubject<string> = new BehaviorSubject<string>('disconnected');

  // Expose the BehaviorSubject as an Observable to other parts of the application
  public connectionStatus$: Observable<string> = this.connectionStatusSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = new WebSocket(this.serverURL);
    this.setupListeners();
    this.connectionStatusSubject.next("connecting");
  }

  private setupListeners(): void {
    if (this.socket == null) {return;}

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server.");
      this.connectionStatusSubject.next("connected");

      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      this.sendIdentification({ type: "GameMaster", id: `game-master-${this.socket?.url}` });
      this.sendMessage("get-current-players", "");
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
        case 'current-players':
          console.log("Received current-players event");
          if (this.currentPlayersObserver) {
            this.currentPlayersObserver.next(data);
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
      this.connectionStatusSubject.next("disconnected")
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
        this.socket?.close();
    };
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxAttempts) {
      const delay = (this.reconnectAttempts + 1) * 2 * 1000; // Exponential backoff
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
      this.connectionStatusSubject.next("reconnecting...")
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
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

  onCurrentPlayers(): Observable<any> {
    return new Observable(observer => {
      this.currentPlayersObserver = observer;
    });
  }

  sendAcknowledgment(msg: string) {
    this.sendMessage('acknowledge', msg);
  }
}
