import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl:    './login.css'
})
export class LoginComponent {
  credentials: LoginCredentials = { email: '', password: '' };
  isLoading    = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (authUser) => {
        this.authService.saveSession(authUser);
        const route = authUser.role === 'vet'
          ? '/auth/profile/vet'
          : '/auth/profile/owner';
        this.router.navigate([route]);
      },
      error: () => {
        this.isLoading    = false;
        this.errorMessage = 'Credenciales incorrectas. Intenta nuevamente.';
      }
    });
  }
}