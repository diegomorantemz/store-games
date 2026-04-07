import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Game, getDiscountedPrice, formatPrice } from '../../models/game.model';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.css'
})
export class GameListComponent implements OnInit{
  games: Game[] = [];
  loading = true;
  error = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (data) => {
        this.games = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar juegos. ¿JSON Server está corriendo?';
        this.loading = false;
      }
    });
  }

  getDiscountedPrice(game: Game): number {
    return getDiscountedPrice(game);
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  addToCart(game: Game): void {
    alert(`🛒 ${game.name} añadido al carrito`);
  }

  addToFavorites(game: Game): void {
    alert(`❤️ ${game.name} añadido a favoritos`);
  }

}
