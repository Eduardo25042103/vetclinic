import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterPayload } from '../../models/auth.model';
import { RoleName } from '../../../../core/models/role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl:    './register.css'
})
export class RegisterComponent {
  payload: RegisterPayload = {
    name:     '',
    username: '',
    email:    '',
    num:      '',
    password: '',
    role:     'owner'
  };

  isLoading    = false;
  errorMessage = '';
  showPassword = false;

  readonly roles: { value: RoleName; label: string; icon: string; desc: string }[] = [
    { value: 'owner', label: 'Dueño',       icon: 'bi-person-heart', desc: 'Registra y gestiona tus mascotas' },
    { value: 'vet',   label: 'Veterinario', icon: 'bi-shield-plus',  desc: 'Atiende pacientes y lleva historial' }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {}

  selectRole(role: RoleName): void {
    this.payload.role = role;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    const { name, username, email, num, password } = this.payload;
    if (!name || !username || !email || !num || !password) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.register(this.payload).subscribe({
      next: (authUser) => {
        this.authService.saveSession(authUser);
        const route = authUser.role === 'vet'
          ? '/auth/profile/vet'
          : '/auth/profile/owner';
        this.router.navigate([route]);
      },
      error: () => {
        this.isLoading    = false;
        this.errorMessage = 'Ocurrió un error al registrarte. Intenta nuevamente.';
      }
    });
  }
}