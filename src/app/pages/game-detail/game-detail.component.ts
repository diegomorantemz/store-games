import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { Game, getDiscountedPrice, formatPrice } from '../../models/game.model';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe],
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})
export class GameDetailComponent implements OnInit {
  game: Game | null = null;
  loading = true;
  error = '';
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private cartService: CartService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadGame(id);
    } else {
      this.error = 'ID de juego no válido';
      this.loading = false;
    }
  }

  loadGame(id: number): void {
    this.gameService.getGameById(id).subscribe({
      next: (data) => {
        this.game = data;
        this.loading = false;
        this.checkIfFavorite();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar el juego';
        this.loading = false;
      }
    });
  }

  checkIfFavorite(): void {
    if (this.game) {
      this.isFavorite = this.favoritesService.isFavorite(this.game.id);
    }
  }

  toggleFavorite(): void {
    if (this.game) {
      this.favoritesService.toggleFavorite(this.game);
      this.isFavorite = !this.isFavorite;
    }
  }

  addToCart(): void {
    if (this.game) {
      this.cartService.addToCart(this.game, 1);
      alert(`🛒 ${this.game.name} añadido al carrito`);
    }
  }

  getDiscountedPrice(): number {
    return this.game ? getDiscountedPrice(this.game) : 0;
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  getFinalPrice(): number {
    return this.game ? getDiscountedPrice(this.game) : 0;
  }

  getOriginalPrice(): number {
    return this.game ? this.game.price : 0;
  }

  hasDiscount(): boolean {
    return this.game ? this.game.discount > 0 : false;
  }
}