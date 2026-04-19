import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesKey = 'user_favorites';
  private favoritesSubject: BehaviorSubject<Game[]>;

  constructor() {
    // Cargar favoritos desde localStorage
    const savedFavorites = localStorage.getItem(this.favoritesKey);
    const initialFavorites: Game[] = savedFavorites ? JSON.parse(savedFavorites) : [];
    this.favoritesSubject = new BehaviorSubject<Game[]>(initialFavorites);
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

  private saveFavorites(favorites: Game[]): void {
    localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }
}