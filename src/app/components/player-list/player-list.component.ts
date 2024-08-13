import { KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlayerService, Player } from 'src/app/services/player.service';
import {PlainWebSocketService} from '../../services/plain-websocket.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  players: { [key: string]: Player} = {};
  private playerFound: boolean = false;

  constructor(private playerService: PlayerService,
              private webSocketService: PlainWebSocketService,
              public dialog: MatDialog) {}

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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { title: 'Start Game', message: 'Are you sure you want to start the game?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.webSocketService.sendMessage('start-game-gm', 'Game started!');
        console.log('Start game event emitted');
      }
    });
  }

  clearCurrentPlayers(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { title: 'Initialize New Game', message: 'Are you sure you want to clear the current players?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.webSocketService.sendMessage('init-new-game', '')
        console.log('Initialising new game. Request to clear players list sent to server.')
      }
    });
  }
}
