import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { isValidEmail, isValidPassword } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = {
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.userData.name.trim()) {
      this.error = 'Ingresa tu nombre completo';
      return;
    }

    if (!this.userData.phone.trim()) {
      this.error = 'Ingresa tu número de teléfono';
      return;
    }

    if (!isValidEmail(this.userData.email)) {
      this.error = 'Ingresa un correo electrónico válido';
      return;
    }

    if (!isValidPassword(this.userData.password)) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    this.userService.checkEmailExists(this.userData.email).subscribe({
      next: (existing) => {
        if (existing.length > 0) {
          this.error = 'Este correo ya está registrado';
          this.loading = false;
          return;
        }

        const { confirmPassword, ...userToRegister } = this.userData;
        this.userService.registerUser(userToRegister).subscribe({
          next: () => {
            this.success = 'Registro exitoso! Ahora puedes iniciar sesión.';
            this.loading = false;
            // Limpiar formulario
            this.userData = {
              name: '',
              phone: '',
              email: '',
              password: '',
              confirmPassword: ''
            };
            this.showPassword = false;
            this.showConfirmPassword = false;
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: () => {
            this.error = 'Error al registrar. Intenta nuevamente.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Error al verificar el correo';
        this.loading = false;
      }
    });
  }
}