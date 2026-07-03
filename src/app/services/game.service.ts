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

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games`);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/games/${id}`);
  }

  searchGames(searchTerm: string): Observable<Game[]> {

    return this.http.get<Game[]>(`${this.apiUrl}/games?q=${searchTerm}`);
  }

  searchGamesByName(searchTerm: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games?name_like=${searchTerm}`);
  }

}