import { Injectable } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';
import {LoggerService} from './logger.service';

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

  constructor(private logger: LoggerService) {
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
      this.logger.log("Connected to WebSocket server.");
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
          this.logger.log("Received current-players event");
          if (this.currentPlayersObserver) {
            this.currentPlayersObserver.next(data);
          }
          break;
        case 'start-game':
          this.logger.log("Received start-game event");
          break;
        default:
          this.logger.log("Unknown event type:", type);
          break;
      }
    };

    this.socket.onclose = () => {
      this.logger.log("Disconnected from WebSocket server.");
      this.connectionStatusSubject.next("disconnected")
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      this.logger.error("WebSocket error:", error);
        this.socket?.close();
    };
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxAttempts) {
      const delay = (this.reconnectAttempts + 1) * 2 * 1000; // Exponential backoff
      this.logger.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
      this.connectionStatusSubject.next("reconnecting...")
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      this.logger.error("Max reconnect attempts reached. Please check the server.");
    }
  }

  sendMessage(eventType: string, msg: string) {
    this.socket?.send(JSON.stringify({ type: eventType, data: msg }));
  }

  sendIdentification(data: object) {
    this.logger.log("Sending identification" + JSON.stringify(data));
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
