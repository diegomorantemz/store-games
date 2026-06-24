import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
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
  orderSent = false;

  constructor(
    private cartService: CartService,
    private userService: UserService,
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

  sendWhatsApp(): void {
    if (!this.user) {
      alert('Debes iniciar sesión');
      return;
    }

    this.loading = true;
    this.orderSent = false;

    // Construir mensaje
    let message = 'NUEVO PEDIDO - Store Games\n\n';
    message += 'Cliente: ' + this.user.name + '\n';
    message += 'Email: ' + this.user.email + '\n';
    message += 'Teléfono: ' + this.user.phone + '\n\n';
    message += 'DETALLE DEL PEDIDO:\n';
    message += '------------------------\n\n';

    this.cart.items.forEach((item, index) => {
      const price = this.getItemPrice(item);
      message += `${index + 1}. ${item.game.name}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: ${this.formatPrice(price)}\n`;
      message += `   Subtotal: ${this.formatPrice(price * item.quantity)}\n\n`;
    });

    message += '------------------------\n';
    message += 'TOTAL: ' + this.formatPrice(this.cart.total) + '\n\n';
    message += 'Método de pago: ' + (this.paymentMethod === 'yape' ? 'Yape' : 'Plin') + '\n';
    message += 'Número para pago: +' + this.phoneNumber + '\n\n';
    message += 'Instrucciones:\n';
    message += '1. Realiza el pago al número indicado\n';
    message += '2. Envía el comprobante de pago\n';
    message += '3. Recibirás tus juegos en minutos\n\n';
    message += 'Gracias por tu compra!';

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp en nueva ventana
    window.open(whatsappUrl, '_blank');

    this.loading = false;
    this.orderSent = true;

    // Preguntar si ya realizó el pago después de 6 segundos
    setTimeout(() => {
      this.clearCartAfterPayment();
    }, 6000);
  }

  clearCartAfterPayment(): void {
    if (this.orderSent) {
      const confirmClear = confirm(
        '¿Ya realizaste el pago?\n\n' +
        'Si ya pagaste, haz clic en Aceptar para vaciar tu carrito.\n' +
        'Si aún no pagas, puedes cancelar y tu carrito se mantendrá.'
      );

      if (confirmClear) {
        this.cartService.clearCart();
        alert('Gracias por tu compra!\n\n' +
              'Recibirás tus juegos en tu correo electrónico.\n' +
              'Email: ' + this.user?.email);
        this.router.navigate(['/']);
      } else {
        alert('Tu carrito se mantiene guardado.\n' +
              'Cuando completes el pago, vuelve a confirmar.');
        this.router.navigate(['/cart']);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}