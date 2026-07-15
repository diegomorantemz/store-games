import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { Cart, CartItem } from '../../models/cart.model';
import { User } from '../../models/user.model';
import { formatPrice, getDiscountedPrice } from '../../models/game.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart: Cart = { items: [], total: 0 };
  user: User | null = null;
  loading = false;
  paymentMethod = 'yape';
  phoneNumber = '51964247753';
  cardData = {
    holder: '',
    number: '',
    expiry: '',
    cvv: ''
  };

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userService.isLoggedIn()) {
      alert('Debes iniciar sesión para realizar una compra');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.getCart().subscribe(cart => {
      this.cart = cart;
      if (cart.items.length === 0) {
        alert('Tu carrito está vacío');
        this.router.navigate(['/cart']);
      }
    });

    this.userService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
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

  formatPrice(price: number): string {
    return formatPrice(price);
  }

  getGamePrice(game: any): number {
    return getDiscountedPrice(game);
  }

  confirmPayment(): void {
    if (!this.user) {
      alert('Debes iniciar sesión');
      return;
    }

    if (this.paymentMethod === 'card' && !this.isCardValid()) {
      alert('Completa los datos de la tarjeta');
      return;
    }

    this.saveOrder();
  }

  isCardValid(): boolean {
    const cardNumber = this.cardData.number.replace(/\s/g, '');
    return this.cardData.holder.trim().length > 2 &&
      /^[0-9]{13,19}$/.test(cardNumber) &&
      /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(this.cardData.expiry) &&
      /^[0-9]{3,4}$/.test(this.cardData.cvv);
  }

  getPaymentLabel(): string {
    if (this.paymentMethod === 'yape') {
      return 'Yape';
    }

    if (this.paymentMethod === 'plin') {
      return 'Plin';
    }

    return 'Tarjeta';
  }

  getQrUrl(): string {
    const qrText = `${this.getPaymentLabel()} StoreGames ${this.formatPrice(this.cart.total)} ${this.phoneNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrText)}`;
  }

  saveOrder(): void {
    if (!this.user || this.cart.items.length === 0) {
      return;
    }

    this.loading = true;

    this.orderService.createOrder({
      userId: this.user.id,
      items: this.cart.items,
      paymentMethod: this.getPaymentLabel(),
      total: this.cart.total
    }).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.loading = false;
        alert('Gracias por tu compra!\n\n' +
              'Recibirás tus juegos en tu correo electrónico.\n' +
              'Email: ' + this.user?.email);
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.loading = false;
        alert('No se pudo guardar tu pedido. Inténtalo nuevamente.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
