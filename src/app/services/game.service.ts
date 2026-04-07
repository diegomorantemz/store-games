import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Obtener todos los juegos
  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games`);
  }

  // Obtener un juego por ID
  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/games/${id}`);
  }
}