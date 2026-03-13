import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../../../core/services/pet.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Pet } from '../../../../core/models/pet';
import { Appointment } from '../../../../core/models/appointment';
import { SpeciesLabelPipe } from '../../../../shared/pipes/species-label.pipe';
import { PetAgePipe } from '../../../../shared/pipes/pet-age.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { HighlightUpcomingDirective } from '../../../../shared/directives/highlight-upcoming.directive';
import { StatusBadgeDirective } from '../../../../shared/directives/status-badge.directive';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [
    CommonModule,
    SpeciesLabelPipe,
    PetAgePipe,
    AppointmentStatusPipe,
    HighlightUpcomingDirective,
    StatusBadgeDirective
  ],
  templateUrl: './pet-detail.html',
  styleUrl: './pet-detail.css'
})
export class PetDetail implements OnInit {
  pet: Pet | null             = null;
  appointments: Appointment[] = [];
  isLoading                   = true;
  isVet                       = false;

  readonly speciesColors: Record<string, string> = {
    dog:   'species-dog',
    cat:   'species-cat',
    bunny: 'species-bunny'
  };

  constructor(
    private readonly route:              ActivatedRoute,
    private readonly petService:         PetService,
    private readonly appointmentService: AppointmentService,
    private readonly authService:        AuthService,
    private readonly router:             Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session) { this.router.navigate(['/auth/login']); return; }

    this.isVet   = session.role === 'vet';
    const id     = Number(this.route.snapshot.paramMap.get('id'));

    this.petService.getById(id).subscribe({
      next: (pet) => {
        this.pet = pet;
        this.appointmentService.getByPet(id).subscribe({
          next:  (appts) => { this.appointments = appts; this.isLoading = false; },
          error: ()      => { this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  goBack(): void      { this.router.navigate(['/pets']); }
  goToEdit(): void    { this.router.navigate(['/pets/edit', this.pet?.id]); }
  goToNewAppt(): void { this.router.navigate(['/appointments/new'], { queryParams: { pet_id: this.pet?.id } }); }

  goToHistory(): void {
    this.router.navigate(['/history'], {
      queryParams: { pet_id: this.pet?.id }
    });
  }
}