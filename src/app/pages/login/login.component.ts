import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { isValidEmail } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Ingresa tu correo y contraseña';
      return;
    }

    if (!isValidEmail(this.email)) {
      this.error = 'Ingresa un correo válido';
      return;
    }

    this.loading = true;

    this.userService.loginUser(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        if (!user) {
          this.error = 'Correo o contraseña incorrectos';
          return;
        }

        this.userService.setSession(user);
        alert('Bienvenido de nuevo, ' + user.name);
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}