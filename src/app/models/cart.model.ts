import { Game } from './game.model';

export interface CartItem {
  game: Game;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.game.discount > 0 
      ? item.game.price * (1 - item.game.discount / 100)
      : item.game.price;
    return sum + (price * item.quantity);
  }, 0);
}