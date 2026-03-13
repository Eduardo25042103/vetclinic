import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { PetSpecies } from '../../../../core/models/pet';
import { AppointmentStatus } from '../../../../core/models/appointment';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { PetAgePipe } from '../../../../shared/pipes/pet-age.pipe';
import { SpeciesLabelPipe } from '../../../../shared/pipes/species-label.pipe';
import { HighlightUpcomingDirective } from '../../../../shared/directives/highlight-upcoming.directive';

export interface HeroBadge  { icon: string; label: string; }
export interface StatItem    { value: string; label: string; icon: string; }
export interface FeatureCard { icon: string; title: string; description: string; colorClass: string; }

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentStatusPipe,
    PetAgePipe,
    SpeciesLabelPipe,
    HighlightUpcomingDirective
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements OnInit {

  readonly heroBadges: HeroBadge[] = [
    { icon: 'bi-check2-square', label: 'Sin registro previo' },
    { icon: 'bi-clock',         label: 'Atención 24 horas'  },
    { icon: 'bi-journal-text',  label: 'Historial digital'  }
  ];

  readonly stats: StatItem[] = [
    { value: '5,000+', label: 'Pacientes atendidos',   icon: 'bi-heart-pulse'  },
    { value: '12',     label: 'Veterinarios expertos', icon: 'bi-person-badge' },
    { value: '24/7',   label: 'Disponibilidad',        icon: 'bi-clock-fill'   }
  ];

  readonly features: FeatureCard[] = [
    { icon: 'bi-calendar2-heart', title: 'Agenda rápida',             description: 'Reserva una cita en segundos desde cualquier dispositivo.', colorClass: 'feature-blue'  },
    { icon: 'bi-files',           title: 'Historial completo',         description: 'Todos los registros médicos de tu mascota en un solo lugar.', colorClass: 'feature-green' },
    { icon: 'bi-bell-fill',       title: 'Recordatorios inteligentes', description: 'Recibe alertas de vacunas, controles y desparasitaciones.',   colorClass: 'feature-amber' }
  ];

  readonly demoAppointmentStatus: AppointmentStatus = 'scheduled';
  readonly demoPetSpecies: PetSpecies = 'dog';
  readonly demoPetBirthDate = '2022-06-15';

  isVisible  = false;
  isLoggedIn = false;

  constructor(
    private readonly router:      Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    setTimeout(() => { this.isVisible = true; }, 100);
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  goToAppointments(): void { this.router.navigate(['/appointments']); }

  goToAccount(): void {
    const session = this.authService.getSession();
    if (!session) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const route = session.role === 'vet'
      ? '/auth/profile/vet'
      : '/auth/profile/owner';
    this.router.navigate([route]);
  }

  goToPets(): void { this.router.navigate(['/pets']); }
}