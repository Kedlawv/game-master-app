import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Player {
  id: string;
  name: string;
  disambiguator: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})

// We don't need this. Keeping it as a reference if needed in the future
export class PlayerService {
  private apiUrl = 'http://localhost:8080/api/players'; // URL of your Node.js REST API

  constructor(private http: HttpClient) { }

  addPlayer(player: Player): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, player);
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }
}
