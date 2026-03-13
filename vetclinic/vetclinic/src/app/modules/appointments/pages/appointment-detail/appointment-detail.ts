import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MedicalRecordService } from '../../../../core/services/medical-record.service';
import { PetService } from '../../../../core/services/pet.service';
import { VeterinarianProfileService } from '../../../../core/services/veterinarian-profile.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment';
import { Pet } from '../../../../core/models/pet';
import { MedicalRecord } from '../../../../core/models/medical-record';
import { VeterinarianProfile } from '../../../../core/models/veterinarian-profile';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { PetAgePipe } from '../../../../shared/pipes/pet-age.pipe';
import { SpeciesLabelPipe } from '../../../../shared/pipes/species-label.pipe';
import { StatusBadgeDirective } from '../../../../shared/directives/status-badge.directive';

export interface StatusTransition {
  value: AppointmentStatus;
  label: string;
  icon:  string;
}

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppointmentStatusPipe,
    PetAgePipe,
    SpeciesLabelPipe,
    StatusBadgeDirective
  ],
  templateUrl: './appointment-detail.html',
  styleUrl:    './appointment-detail.css'
})
export class AppointmentDetail implements OnInit {
  appointment:   Appointment | null    = null;
  pet:           Pet | null            = null;
  medicalRecord: MedicalRecord | null  = null;
  vetProfile:    VeterinarianProfile | null = null;
  vetName        = '';
  isLoading      = true;
  isVet          = false;
  isSaving       = false;
  allAppointments: Appointment[]       = [];

  // Reschedule panel state
  showReschedule   = false;
  rescheduleDate   = '';
  rescheduleSlot   = '';
  rescheduleError  = '';

  readonly statusTransitions: StatusTransition[] = [
    { value: 'ongoing',   label: 'Iniciar',    icon: 'bi-play-circle'   },
    { value: 'completed', label: 'Completar',  icon: 'bi-check-circle'  },
    { value: 'cancelled', label: 'Cancelar',   icon: 'bi-x-circle'      }
  ];

  constructor(
    private readonly route:              ActivatedRoute,
    private readonly appointmentService: AppointmentService,
    private readonly recordService:      MedicalRecordService,
    private readonly petService:         PetService,
    private readonly vetService:         VeterinarianProfileService,
    private readonly userService:        UserService,
    private readonly authService:        AuthService,
    private readonly router:             Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session) { this.router.navigate(['/auth/login']); return; }

    this.isVet   = session.role === 'vet';
    const id     = Number(this.route.snapshot.paramMap.get('id'));

    this.appointmentService.getById(id).subscribe({
      next: (appt) => {
        this.appointment = appt;
        forkJoin({
          pet:     this.petService.getById(appt.pet_id),
          vets:    this.vetService.getAll(),
          users:   this.userService.getAll(),
          records: this.recordService.getAll(),
          allAppts: this.appointmentService.getAll()
        }).subscribe({
          next: ({ pet, vets, users, records, allAppts }) => {
            this.pet              = pet;
            this.vetProfile       = vets.find((v) => v.id === appt.veterinarian_id) ?? null;
            const vetUser         = users.find((u) => u.id === this.vetProfile?.user_id);
            this.vetName          = vetUser?.name ?? '—';
            this.medicalRecord    = records.find((r) => r.appointment_id === appt.id) ?? null;
            this.allAppointments  = allAppts;
            this.isLoading        = false;
          },
          error: () => { this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  get availableTransitions(): StatusTransition[] {
    if (!this.appointment) return [];
    return this.statusTransitions.filter((t) => t.value !== this.appointment!.status);
  }

  get canReschedule(): boolean {
    if (!this.appointment) return false;
    return this.appointment.status === 'scheduled' || this.appointment.status === 'cancelled';
  }

  get minDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get rescheduleSlots(): string[] {
    if (!this.vetProfile?.availability_start || !this.vetProfile?.availability_end || !this.rescheduleDate) return [];

    const [sh] = this.vetProfile.availability_start.split(':').map(Number);
    const [eh] = this.vetProfile.availability_end.split(':').map(Number);
    let cur = sh * 60;
    const end = eh * 60;
    const slots: string[] = [];

    const bookedSlots = new Set(
      this.allAppointments
        .filter((a) =>
          a.veterinarian_id === this.appointment!.veterinarian_id &&
          a.datetime.startsWith(this.rescheduleDate) &&
          a.id !== this.appointment!.id
        )
        .map((a) => a.datetime.slice(11, 16))
    );

    while (cur < end) {
      const h = String(Math.floor(cur / 60)).padStart(2, '0');
      const m = String(cur % 60).padStart(2, '0');
      const slot = `${h}:${m}`;
      if (!bookedSlots.has(slot)) slots.push(slot);
      cur += 30;
    }
    return slots;
  }

  get hasFreeSlots(): boolean {
    return !this.vetProfile?.availability_start;
  }

  openReschedule(): void {
    this.rescheduleDate  = '';
    this.rescheduleSlot  = '';
    this.rescheduleError = '';
    this.showReschedule  = true;
  }

  onRescheduleDateChange(): void {
    this.rescheduleSlot = '';
  }

  confirmReschedule(): void {
    if (!this.appointment) return;

    let newDatetime = '';

    if (this.hasFreeSlots) {
      // Vet or no availability configured — use free datetime field
      if (!this.rescheduleDate) {
        this.rescheduleError = 'Selecciona una fecha y hora.';
        return;
      }
      newDatetime = this.rescheduleDate; // datetime-local value
    } else {
      if (!this.rescheduleDate || !this.rescheduleSlot) {
        this.rescheduleError = 'Selecciona una fecha y un horario.';
        return;
      }
      newDatetime = `${this.rescheduleDate}T${this.rescheduleSlot}`;
    }

    this.isSaving = true;
    this.rescheduleError = '';

    this.appointmentService.update(this.appointment.id, {
      datetime: newDatetime,
      status:   'scheduled'
    }).subscribe({
      next: (updated) => {
        this.appointment    = updated;
        this.showReschedule = false;
        this.isSaving       = false;
      },
      error: () => {
        this.isSaving        = false;
        this.rescheduleError = 'Error al reprogramar. Intenta de nuevo.';
      }
    });
  }

  cancelReschedule(): void {
    this.showReschedule = false;
  }

  changeStatus(status: AppointmentStatus): void {
    if (!this.appointment) return;
    this.isSaving = true;
    this.appointmentService.update(this.appointment.id, { status }).subscribe({
      next: (updated) => {
        this.appointment = updated;
        this.isSaving    = false;
      },
      error: () => { this.isSaving = false; }
    });
  }

  goBack(): void { this.router.navigate(['/appointments']); }

  goToMedicalRecord(): void {
    if (!this.appointment) return;
    if (this.medicalRecord) {
      this.router.navigate(['/history/edit', this.medicalRecord.id]);
    } else {
      this.router.navigate(['/history/new'], {
        queryParams: {
          appointment_id: this.appointment.id,
          pet_id: this.appointment.pet_id
        }
      });
    }
  }
}