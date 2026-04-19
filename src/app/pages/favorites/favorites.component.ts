import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';
import { Game, formatPrice, getDiscountedPrice } from '../../models/game.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: Game[] = [];

  constructor(
    private favoritesService: FavoritesService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favoritesService.getFavorites().subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  getGamePrice(game: Game): number {
    return getDiscountedPrice(game);
  }

  removeFromFavorites(gameId: number): void {
    this.favoritesService.removeFromFavorites(gameId);
  }

  addToCart(game: Game, button: HTMLButtonElement): void {
    this.cartService.addToCart(game, 1);
    
    const originalText = button.innerText;
    button.innerText = '✓ Añadido!';
    button.disabled = true;
    
    setTimeout(() => {
      button.innerText = originalText;
      button.disabled = false;
    }, 1500);
  }
}