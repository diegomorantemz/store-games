import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  itemCount = 0;
  user: User | null = null;

  constructor(
    private cartService: CartService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(cart => {
      this.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.userService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }

  logout(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.userService.logout();
      this.user = null;
    }
  }

  closeMenu(): void {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  }
}