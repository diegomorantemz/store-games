import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User, isValidEmail, isValidPassword, isValidPhone } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editMode = false;
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

  ngOnInit(): void {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (user) {
        this.userData = {
          name: user.name,
          phone: user.phone,
          email: user.email,
          password: '',
          confirmPassword: ''
        };
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.error = '';
    this.success = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    if (this.user) {
      this.userData = {
        name: this.user.name,
        phone: this.user.phone,
        email: this.user.email,
        password: '',
        confirmPassword: ''
      };
    }
  }

  onUpdate(): void {
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
    
    if (!isValidPhone(this.userData.phone)) {
      this.error = 'El teléfono debe tener 9 dígitos y solo números (ej: 999123456)';
      return;
    }

    if (!isValidEmail(this.userData.email)) {
      this.error = 'Ingresa un correo electrónico válido';
      return;
    }

    if (this.userData.password) {
      if (!isValidPassword(this.userData.password)) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }
      if (this.userData.password !== this.userData.confirmPassword) {
        this.error = 'Las contraseñas no coinciden';
        return;
      }
    }

    this.loading = true;

    this.userService.checkEmailExists(this.userData.email).subscribe({
      next: (existingUsers) => {

        const otherUserWithEmail = existingUsers.find(
          u => u.id !== this.user?.id
        );

        if (otherUserWithEmail) {
          this.error = 'Este correo electrónico ya está registrado por otro usuario';
          this.loading = false;
          return;
        }

        this.updateUser();
      },
      error: () => {
        this.error = 'Error al verificar el correo';
        this.loading = false;
      }
    });
  }

  updateUser(): void {
    const updatedUser: User = {
      id: this.user!.id,
      name: this.userData.name,
      phone: this.userData.phone,
      email: this.userData.email,
      password: this.userData.password || this.user!.password,
      registeredAt: this.user!.registeredAt
    };

    this.userService.updateUser(updatedUser).subscribe({
      next: (user) => {
        this.success = 'Datos actualizados correctamente';
        this.loading = false;
        this.user = user;
        this.userService.setSession(user);
        this.editMode = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
      },
      error: () => {
        this.error = 'Error al actualizar los datos';
        this.loading = false;
      }
    });
  }

  logout(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.userService.logout();
      this.router.navigate(['/login']);
    }
  }
}