import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/order.model';
import { CartItem } from '../../models/cart.model';
import { formatPrice, getDiscountedPrice } from '../../models/game.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getCurrentUser().subscribe(user => {
      if (!user) {
        return;
      }

      this.orderService.getOrdersByUser(user.id).subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar tus pedidos';
          this.loading = false;
        }
      });
    });
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  getItemPrice(item: CartItem): number {
    return getDiscountedPrice(item.game);
  }

  getItemSubtotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  openVoucher(order: Order): void {
    this.selectedOrder = order;
  }

  closeVoucher(): void {
    this.selectedOrder = null;
  }
}
