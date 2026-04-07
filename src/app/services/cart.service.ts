import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Cart, calculateTotal } from '../models/cart.model';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'shopping_cart';
  private cartSubject: BehaviorSubject<Cart>;

  constructor() {
    // Cargar carrito desde localStorage al iniciar
    const savedCart = localStorage.getItem(this.cartKey);
    const initialCart: Cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    this.cartSubject = new BehaviorSubject<Cart>(initialCart);
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
      // Actualizar cantidad si ya existe
      newItems = currentCart.items.map(item =>
        item.game.id === game.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Agregar nuevo item
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

  private saveCart(cart: Cart): void {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }
}