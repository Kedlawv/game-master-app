import { Component, OnInit } from '@angular/core';
import { PlayerService, Player } from 'src/app/services/player.service';
import {PlainWebSocketService} from '../../services/plain-websocket.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];

  constructor(private playerService: PlayerService, private webSocketService: PlainWebSocketService) {}

  ngOnInit(): void {
    this.webSocketService.onNewPlayer().subscribe((player: Player) => {
      console.log('Received new-player from websocket:', player);
      this.players.push(player); // Add new player to the list
    });
  }

  startGame(): void {
    this.webSocketService.sendMessage('start-game-gm', 'Game started!');
    console.log('Start game event emitted');
  }
}
