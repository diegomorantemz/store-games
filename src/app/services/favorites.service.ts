import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject: BehaviorSubject<Game[]>;
  private currentUserId: number | null = null;

  constructor(private userService: UserService) {
    this.favoritesSubject = new BehaviorSubject<Game[]>([]);

    this.userService.getCurrentUser().subscribe(user => {
      this.currentUserId = user ? user.id : null;
      this.loadFavorites();
    });
  }

  private getStorageKey(): string {
    return this.currentUserId ? `favorites_user_${this.currentUserId}` : 'favorites_guest';
  }

  private loadFavorites(): void {
    const key = this.getStorageKey();
    const savedFavorites = localStorage.getItem(key);
    const favorites: Game[] = savedFavorites ? JSON.parse(savedFavorites) : [];
    this.favoritesSubject.next(favorites);
  }

  private saveFavorites(favorites: Game[]): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }

  getFavorites(): Observable<Game[]> {
    return this.favoritesSubject.asObservable();
  }

  getFavoritesSnapshot(): Game[] {
    return this.favoritesSubject.value;
  }

  addToFavorites(game: Game): void {
    const currentFavorites = this.favoritesSubject.value;
    const exists = currentFavorites.some(fav => fav.id === game.id);
    
    if (!exists) {
      const newFavorites = [...currentFavorites, game];
      this.saveFavorites(newFavorites);
    }
  }

  removeFromFavorites(gameId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const newFavorites = currentFavorites.filter(game => game.id !== gameId);
    this.saveFavorites(newFavorites);
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