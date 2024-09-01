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

export class PlayerService {

}
