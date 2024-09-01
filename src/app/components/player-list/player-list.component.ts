import {Component, OnInit} from '@angular/core';
import {Player} from 'src/app/services/player.service';
import {PlainWebSocketService} from '../../services/plain-websocket.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';
import {LoggerService} from '../../services/logger.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  players: { [key: string]: Player} = {};
  private playerFound: boolean = false;
  connectionStatus: string = 'disconnected';

  constructor(private webSocketService: PlainWebSocketService,
              private logger: LoggerService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.webSocketService.onNewPlayer().subscribe((player: Player) => {
      this.logger.log('Received new-player from websocket:', player);
      this.players[player.id]= player; // Add new player to the list
    });
    this.webSocketService.onPlayerScore().subscribe((player: Player) => {
      this.logger.log('Received player-score from websocket:', player);
      this.players[player.id] = player;
    });

    this.webSocketService.onCurrentPlayers().subscribe((players: { [key: string]: Player}) => {
      this.logger.log('Received current players from websocket:', players);
      this.players = players;
    });

    // Subscribe to the connection status Observable
    this.webSocketService.connectionStatus$.subscribe((status: string) => {
      this.connectionStatus = status;
      this.logger.log(`Connection status updated: ${status}`);
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
        this.logger.log('Start game event emitted');
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
        this.logger.log('Initialising new game. Request to clear players list sent to server.')
      }
    });
  }
}
