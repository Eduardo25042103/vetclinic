import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PetService } from '../../../../core/services/pet.service';
import { VeterinarianProfileService } from '../../../../core/services/veterinarian-profile.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { HighlightUpcomingDirective } from '../../../../shared/directives/highlight-upcoming.directive';
import { StatusBadgeDirective } from '../../../../shared/directives/status-badge.directive';

export interface AppointmentRow {
  appointment: Appointment;
  petName:     string;
  vetName:     string;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentStatusPipe,
    HighlightUpcomingDirective,
    StatusBadgeDirective
  ],
  templateUrl: './appointment-list.html',
  styleUrl:    './appointment-list.css'
})
export class AppointmentList implements OnInit {
  rows:      AppointmentRow[] = [];
  isLoading = true;
  isVet     = false;

  
  

  activeFilter: AppointmentStatus | 'all' = 'all';

  readonly filters: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all',       label: 'Todas'      },
    { value: 'scheduled', label: 'Programadas' },
    { value: 'ongoing',   label: 'En curso'    },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas'  }
  ];

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly petService:         PetService,
    private readonly vetService:         VeterinarianProfileService,
    private readonly userService:        UserService,
    private readonly authService:        AuthService,
    private readonly router:             Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session) { this.router.navigate(['/auth/login']); return; }

    this.isVet = session.role === 'vet';

    const pets$ = this.isVet
      ? this.petService.getAll()
      : this.petService.getByOwner(session.ownerProfile!.id);

    forkJoin({
      pets:  pets$,
      vets:  this.vetService.getAll(),
      users: this.userService.getAll()
    }).subscribe({
      next: ({ pets, vets, users }) => {
        const appts$ = this.isVet
          ? this.appointmentService.getByVet(session.vetProfile!.id)
          : this.appointmentService.getAll();

        appts$.subscribe({
          next: (appointments) => {
            const ownerPetIds = new Set(pets.map((p) => p.id));

            const filtered = this.isVet
              ? appointments
              : appointments.filter((a) => ownerPetIds.has(a.pet_id));

            this.rows = filtered.map((appt) => {
              const pet     = pets.find((p) => p.id === appt.pet_id);
              const vetProf = vets.find((v) => v.id === appt.veterinarian_id);
              const vetUser = users.find((u) => u.id === vetProf?.user_id);
              return {
                appointment: appt,
                petName:     pet?.name     ?? '—',
                vetName:     vetUser?.name ?? '—'
              };
            });
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  get filteredRows(): AppointmentRow[] {
    if (this.activeFilter === 'all') return this.rows;
    return this.rows.filter((r) => r.appointment.status === this.activeFilter);
  }

  setFilter(f: AppointmentStatus | 'all'): void {
    this.activeFilter = f;
  }

  goToDetail(id: number): void { this.router.navigate(['/appointments', id]); }
  goToNew(): void              { this.router.navigate(['/appointments/new']); }
}