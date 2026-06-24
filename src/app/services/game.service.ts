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

  // Buscar juegos por nombre (búsqueda parcial)
  searchGames(searchTerm: string): Observable<Game[]> {
    // JSON Server soporta búsqueda con 'q' para búsqueda parcial en todos los campos
    return this.http.get<Game[]>(`${this.apiUrl}/games?q=${searchTerm}`);
  }

  // Buscar específicamente por nombre
  searchGamesByName(searchTerm: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games?name_like=${searchTerm}`);
  }

}