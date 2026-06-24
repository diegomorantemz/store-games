import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Cart, calculateTotal } from '../models/cart.model';
import { Game } from '../models/game.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject: BehaviorSubject<Cart>;
  private currentUserId: number | null = null;

  constructor(private userService: UserService) {
    this.cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0 });

    // Escuchar cambios de usuario
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUserId = user ? user.id : null;
      this.loadCart();
    });
  }

  private getStorageKey(): string {
    return this.currentUserId ? `cart_user_${this.currentUserId}` : 'cart_guest';
  }

  private loadCart(): void {
    const key = this.getStorageKey();
    const savedCart = localStorage.getItem(key);
    const cart: Cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    this.cartSubject.next(cart);
  }

  private saveCart(cart: Cart): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  getCart(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  getCartSnapshot(): Cart {
    return this.cartSubject.value;
  }

  addToCart(game: Game, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(item => item.game.id === game.id);

    let newItems: CartItem[];
    
    if (existingItem) {
      newItems = currentCart.items.map(item =>
        item.game.id === game.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...currentCart.items, { game, quantity }];
    }

    const newCart: Cart = {
      items: newItems,
      total: calculateTotal(newItems)
    };

    this.saveCart(newCart);
  }

  removeFromCart(gameId: number): void {
    const currentCart = this.cartSubject.value;
    const newItems = currentCart.items.filter(item => item.game.id !== gameId);
    
    const newCart: Cart = {
      items: newItems,
      total: calculateTotal(newItems)
    };

    this.saveCart(newCart);
  }

  updateQuantity(gameId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(gameId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const newItems = currentCart.items.map(item =>
      item.game.id === gameId ? { ...item, quantity } : item
    );

    const newCart: Cart = {
      items: newItems,
      total: calculateTotal(newItems)
    };

    this.saveCart(newCart);
  }

  clearCart(): void {
    this.saveCart({ items: [], total: 0 });
  }

  getItemCount(): number {
    return this.cartSubject.value.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}