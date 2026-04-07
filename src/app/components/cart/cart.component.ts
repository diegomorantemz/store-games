import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/cart.model';
import { formatPrice } from '../../models/game.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart = { items: [], total: 0 };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(cart => {
      this.cart = cart;
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  getItemPrice(item: CartItem): number {
    if (item.game.discount > 0) {
      return item.game.price * (1 - item.game.discount / 100);
    }
    return item.game.price;
  }

  getItemSubtotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  updateQuantity(gameId: number, quantity: number): void {
    this.cartService.updateQuantity(gameId, quantity);
  }

  removeItem(gameId: number): void {
    this.cartService.removeFromCart(gameId);
  }

  clearCart(): void {
    if (confirm('¿Vaciar todo el carrito?')) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    alert('Próximamente: integración con WhatsApp');
  }
}
