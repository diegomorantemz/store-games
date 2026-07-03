export interface Game {
  id: number;
  name: string;
  price: number;
  discount: number;
  imageUrl: string;
  category: string;
  description: string;
  trailerUrl: string;
  stock: number;
  releaseDate?: string;
}

export function getDiscountedPrice(game: Game): number {
  if (game.discount > 0) {
    return game.price * (1 - game.discount / 100);
  }
  return game.price;
}

export function formatPrice(price: number): string {
  return `S/ ${price.toFixed(2)}`;
}