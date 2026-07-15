import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { Game, getDiscountedPrice, formatPrice } from '../../models/game.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  allGames: Game[] = [];
  filteredGames: Game[] = [];
  loading = true;
  error = '';
  favorites: Game[] = [];
  searchTerm: string = '';
  searching: boolean = false;

  constructor(
    private gameService: GameService,
    private cartService: CartService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadGames();
    this.loadFavorites();
  }

  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (data) => {
        this.allGames = data;
        this.filteredGames = data;
        this.loading = false;

        if (this.searchTerm) {
          this.filterGamesLocally();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar juegos. ¿El servidor SQLite está corriendo?';
        this.loading = false;
      }
    });
  }

  filterGamesLocally(): void {
    if (!this.searchTerm.trim()) {
      this.filteredGames = this.allGames;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredGames = this.allGames.filter(game =>
      game.name.toLowerCase().includes(term) ||
      game.category.toLowerCase().includes(term)
    );
  }

  onSearchInput(): void {
    this.filterGamesLocally();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredGames = this.allGames;
  }

  loadFavorites(): void {
    this.favoritesService.getFavorites().subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  isFavorite(gameId: number): boolean {
    return this.favoritesService.isFavorite(gameId);
  }

  getDiscountedPrice(game: Game): number {
    return getDiscountedPrice(game);
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  addToCart(game: Game, button: HTMLButtonElement): void {
    this.cartService.addToCart(game, 1);
    
    const originalText = button.innerText;
    button.innerText = 'Añadido!';
    button.disabled = true;
    
    setTimeout(() => {
      button.innerText = originalText;
      button.disabled = false;
    }, 1500);
  }

  toggleFavorite(game: Game): void {
    this.favoritesService.toggleFavorite(game);
    this.loadFavorites();
  }
}
