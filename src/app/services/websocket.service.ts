import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:8080');
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket.on('connect', () => {
      console.log("Connected to WebSocket server.");
      this.sendIdentification({ type: "GameMaster", id: `game-master-${this.socket.id}`});
      this.sendMessage('registerGameMaster', '');
    });
  }

  sendMessage(eventType: string, msg: string) {
    this.socket.emit(eventType, msg);
  }

  sendIdentification(data: object) {
    console.log("Sending identification" + JSON.stringify(data));
    this.socket.emit("identify", data);
  }

  onNewPlayer(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new-player', (data) => {
        console.log("Received new-player event with data:", data);
        observer.next(data);
      });
    });
  }

  sendAcknowledgment(msg: string) {
    this.socket.emit('acknowledge', msg);
  }
}
