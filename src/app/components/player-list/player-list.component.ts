import { KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlayerService, Player } from 'src/app/services/player.service';
import {PlainWebSocketService} from '../../services/plain-websocket.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  players: { [key: string]: Player} = {};
  private playerFound: boolean = false;

  constructor(private playerService: PlayerService, private webSocketService: PlainWebSocketService) {}

  ngOnInit(): void {
    this.webSocketService.onNewPlayer().subscribe((player: Player) => {
      console.log('Received new-player from websocket:', player);
      this.players[player.id]= player; // Add new player to the list
    });
    this.webSocketService.onPlayerScore().subscribe((player: Player) => {
      console.log('Received player-score from websocket:', player);
      this.players[player.id] = player;
    });

    this.webSocketService.onCurrentPlayers().subscribe((players: { [key: string]: Player}) => {
      console.log('Received player-score from websocket:', players);
      this.players = players;
    });
  }


  startGame(): void {
    this.webSocketService.sendMessage('start-game-gm', 'Game started!');
    console.log('Start game event emitted');
  }
}
