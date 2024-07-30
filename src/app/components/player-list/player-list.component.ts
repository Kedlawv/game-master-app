import { Component, OnInit } from '@angular/core';
import { PlayerService, Player } from 'src/app/services/player.service';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];

  constructor(private playerService: PlayerService, private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.webSocketService.onNewPlayer().subscribe((player: Player) => {
      console.log('Received new-player from websocket:', player);
      this.players.push(player); // Add new player to the list
    });
  }
}
