import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = 'http://localhost:3000';
  private favoritesSubject: BehaviorSubject<Game[]>;
  private currentUserId: string | null = null;

  constructor(
    private userService: UserService,
    private http: HttpClient
  ) {
    this.favoritesSubject = new BehaviorSubject<Game[]>([]);
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUserId = user ? user.id : null;
      this.loadFavorites();
    });
  }

  private getOwnerId(): string {
    return this.currentUserId ? `user_${this.currentUserId}` : 'guest';
  }

  private loadFavorites(): void {
    this.http.get<Game[]>(`${this.apiUrl}/favorites/${this.getOwnerId()}`).subscribe({
      next: (favorites) => this.favoritesSubject.next(favorites),
      error: () => this.favoritesSubject.next([])
    });
  }

  private saveFavorites(favorites: Game[]): void {
    this.favoritesSubject.next(favorites);
    this.http.put<Game[]>(`${this.apiUrl}/favorites/${this.getOwnerId()}`, favorites).subscribe({
      error: () => this.loadFavorites()
    });
  }

  getFavorites(): Observable<Game[]> {
    return this.favoritesSubject.asObservable();
  }

  getFavoritesSnapshot(): Game[] {
    return this.favoritesSubject.value;
  }

  addToFavorites(game: Game): void {
    const currentFavorites = this.favoritesSubject.value;
    if (!currentFavorites.some(fav => fav.id === game.id)) {
      this.saveFavorites([...currentFavorites, game]);
    }
  }

  removeFromFavorites(gameId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    this.saveFavorites(currentFavorites.filter(game => game.id !== gameId));
  }

  toggleFavorite(game: Game): boolean {
    const currentFavorites = this.favoritesSubject.value;
    const exists = currentFavorites.some(fav => fav.id === game.id);
    if (exists) {
      this.removeFromFavorites(game.id);
      return false;
    } else {
      this.addToFavorites(game);
      return true;
    }
  }

  isFavorite(gameId: number): boolean {
    return this.favoritesSubject.value.some(game => game.id === gameId);
  }

  clearFavorites(): void {
    this.saveFavorites([]);
  }
}
