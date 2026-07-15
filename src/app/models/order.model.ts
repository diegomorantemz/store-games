import { CartItem } from './cart.model';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  paymentMethod: string;
  total: number;
  createdAt: string;
}
