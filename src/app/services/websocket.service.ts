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
  }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  onUpdatePlayers(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('updatePlayers', (data) => {
        console.log("Received updatePlayers event with data:", data);
        observer.next(data);
      });
    });
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
