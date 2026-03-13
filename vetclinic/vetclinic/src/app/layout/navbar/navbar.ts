import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

export interface NavLink {
  label: string;
  route: string;
  hasDropdown: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  @Input() brandName: string = 'Vet Clinic';
  @Input() logoIcon: string  = 'bi-heart-pulse-fill';

  readonly navLinks: NavLink[] = [
    { label: 'Nosotros',  route: '/nosotros',  hasDropdown: true  },
    { label: 'Servicios', route: '/servicios', hasDropdown: true  },
    { label: 'Clínica',   route: '/clinica',   hasDropdown: true  },
    { label: 'Blog',      route: '/blog',      hasDropdown: false }
  ];

  isScrolled  = false;
  isMenuOpen  = false;
  isLoggedIn  = false;
  userName    = '';

  constructor(
    private readonly router:      Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkSession();

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }
  }

  checkSession(): void {
    const session = this.authService.getSession();
    this.isLoggedIn = !!session;
    this.userName   = session?.user.name ?? '';
  }

  goToProfile(): void {
    const session = this.authService.getSession();
    if (!session) return;
    const route = session.role === 'vet'
      ? '/auth/profile/vet'
      : '/auth/profile/owner';
    this.router.navigate([route]);
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.clearSession();
    this.isLoggedIn = false;
    this.userName   = '';
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMenuOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}