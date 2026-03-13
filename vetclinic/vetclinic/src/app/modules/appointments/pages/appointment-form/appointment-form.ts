import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PetService } from '../../../../core/services/pet.service';
import { VeterinarianProfileService } from '../../../../core/services/veterinarian-profile.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Appointment } from '../../../../core/models/appointment';
import { Pet } from '../../../../core/models/pet';

export interface VetOption {
  veterinarian_id:    number;
  name:               string;
  specialty:          string;
  availability_start?: string;
  availability_end?:   string;
}

export interface CalendarDay {
  date:        Date;
  dateStr:     string; 
  dayNum:      number;
  isToday:     boolean;
  isPast:      boolean;
  isOtherMonth: boolean;
  totalSlots:  number;   
  freeSlots:   number;   
}

export interface SlotInfo {
  time:   string;   
  booked: boolean;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-form.html',
  styleUrl:    './appointment-form.css'
})
export class AppointmentForm implements OnInit {
  isEditMode   = false;
  isLoading    = true;
  isSaving     = false;
  isOwner      = false;
  errorMessage = '';
  appointmentId: number | null = null;

  petId:           number = 0;
  veterinarianId:  number = 0;
  datetime:        string = '';
  durationMinutes: number = 30;
  reason:          string = '';

  selectedDate = '';
  selectedSlot = '';

  pets:        Pet[]       = [];
  vetOptions:  VetOption[] = [];
  existingAppointments: Appointment[] = [];

  // Calendar state
  calendarYear  = 0;
  calendarMonth = 0;  // 0-based
  calendarWeeks: CalendarDay[][] = [];
  readonly weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  readonly monthNames = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  // Slot info for selected day
  daySlots: SlotInfo[] = [];

  readonly durationOptions = [15, 30, 45, 60, 90];

  constructor(
    private readonly route:              ActivatedRoute,
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

    this.isOwner = session.role === 'owner';

    const today = new Date();
    this.calendarYear  = today.getFullYear();
    this.calendarMonth = today.getMonth();

    const petIdParam = this.route.snapshot.queryParamMap.get('pet_id');
    if (petIdParam) this.petId = Number(petIdParam);

    const pets$ = this.isOwner
      ? this.petService.getByOwner(session.ownerProfile!.id)
      : this.petService.getAll();

    forkJoin({
      pets:         pets$,
      vets:         this.vetService.getAll(),
      users:        this.userService.getAll(),
      appointments: this.appointmentService.getAll()
    }).subscribe({
      next: ({ pets, vets, users, appointments }) => {
        this.pets                 = pets;
        this.existingAppointments = appointments;
        this.vetOptions = vets.map((v) => {
          const u = users.find((x) => x.id === v.user_id);
          return {
            veterinarian_id:    v.id,
            name:               u?.name ?? '—',
            specialty:          v.specialty,
            availability_start: v.availability_start,
            availability_end:   v.availability_end
          };
        });

        if (!this.isOwner) {
          this.veterinarianId = session.vetProfile!.id;
        }

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.isEditMode    = true;
          this.appointmentId = Number(id);
          this.appointmentService.getById(this.appointmentId).subscribe({
            next: (appt) => {
              this.petId           = appt.pet_id;
              this.veterinarianId  = appt.veterinarian_id;
              this.datetime        = appt.datetime.slice(0, 16);
              this.durationMinutes = appt.duration_minutes;
              this.reason          = appt.reason;
              if (this.isOwner) {
                this.selectedDate = this.datetime.slice(0, 10);
                this.selectedSlot = this.datetime.slice(11, 16);
                const d = new Date(this.selectedDate + 'T00:00:00');
                this.calendarYear  = d.getFullYear();
                this.calendarMonth = d.getMonth();
                this.buildDaySlots(this.selectedDate);
              }
              this.buildCalendar();
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
          });
        } else {
          this.buildCalendar();
          this.isLoading = false;
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ── Calendar ────────────────────────────────────────────────────

  get selectedVet(): VetOption | undefined {
    return this.vetOptions.find((v) => v.veterinarian_id === Number(this.veterinarianId));
  }

  get calendarTitle(): string {
    return `${this.monthNames[this.calendarMonth]} ${this.calendarYear}`;
  }

  prevMonth(): void {
    if (this.calendarMonth === 0) { this.calendarMonth = 11; this.calendarYear--; }
    else { this.calendarMonth--; }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.calendarMonth === 11) { this.calendarMonth = 0; this.calendarYear++; }
    else { this.calendarMonth++; }
    this.buildCalendar();
  }

  buildCalendar(): void {
    const vet   = this.selectedVet;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
    const lastDay  = new Date(this.calendarYear, this.calendarMonth + 1, 0);

    // Monday-first: 0=Mon … 6=Sun
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalendarDay[] = [];

    // Fill leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(this.calendarYear, this.calendarMonth, -i);
      days.push(this.makeDay(d, today, vet, true));
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.calendarYear, this.calendarMonth, d);
      days.push(this.makeDay(date, today, vet, false));
    }

    // Trailing days to complete last row
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(this.calendarYear, this.calendarMonth + 1, i);
      days.push(this.makeDay(d, today, vet, true));
    }

    // Chunk into weeks
    this.calendarWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.calendarWeeks.push(days.slice(i, i + 7));
    }
  }

  private makeDay(
    date: Date,
    today: Date,
    vet: VetOption | undefined,
    isOtherMonth: boolean
  ): CalendarDay {
    const dateStr  = this.toDateStr(date);
    const isPast   = date < today;
    const isToday  = date.getTime() === today.getTime();

    let totalSlots = 0;
    let freeSlots  = 0;

    if (vet?.availability_start && vet?.availability_end && !isPast) {
      const [sh] = vet.availability_start.split(':').map(Number);
      const [eh] = vet.availability_end.split(':').map(Number);
      totalSlots  = (eh - sh) * 2;

      const booked = this.existingAppointments.filter(
        (a) =>
          a.veterinarian_id === Number(this.veterinarianId) &&
          a.datetime.startsWith(dateStr) &&
          a.id !== (this.appointmentId ?? -1)
      ).length;

      freeSlots = Math.max(0, totalSlots - booked);
    }

    return { date, dateStr, dayNum: date.getDate(), isToday, isPast, isOtherMonth, totalSlots, freeSlots };
  }

  selectDay(day: CalendarDay): void {
    if (day.isPast || day.isOtherMonth || !day.freeSlots) return;
    this.selectedDate = day.dateStr;
    this.selectedSlot = '';
    this.buildDaySlots(day.dateStr);
  }

  buildDaySlots(dateStr: string): void {
    const vet = this.selectedVet;
    if (!vet?.availability_start || !vet?.availability_end) { this.daySlots = []; return; }

    const [sh] = vet.availability_start.split(':').map(Number);
    const [eh] = vet.availability_end.split(':').map(Number);

    const bookedTimes = new Set(
      this.existingAppointments
        .filter((a) =>
          a.veterinarian_id === Number(this.veterinarianId) &&
          a.datetime.startsWith(dateStr) &&
          a.id !== (this.appointmentId ?? -1)
        )
        .map((a) => a.datetime.slice(11, 16))
    );

    const slots: SlotInfo[] = [];
    let cur = sh * 60;
    while (cur < eh * 60) {
      const h    = String(Math.floor(cur / 60)).padStart(2, '0');
      const m    = String(cur % 60).padStart(2, '0');
      const time = `${h}:${m}`;
      slots.push({ time, booked: bookedTimes.has(time) });
      cur += 30;
    }
    this.daySlots = slots;
  }

  onVetChange(): void {
    this.selectedDate = '';
    this.selectedSlot = '';
    this.daySlots     = [];
    this.datetime     = '';
    this.buildCalendar();
  }

  onSlotSelect(slot: SlotInfo): void {
    if (slot.booked) return;
    this.selectedSlot = slot.time;
    this.datetime     = `${this.selectedDate}T${slot.time}`;
  }

  dayClass(day: CalendarDay): string {
    if (day.isOtherMonth) return 'cal-day other-month';
    if (day.isPast)       return 'cal-day past';
    if (!this.selectedVet?.availability_start) return 'cal-day no-schedule';
    if (day.freeSlots === 0) return 'cal-day full';
    if (day.dateStr === this.selectedDate) return 'cal-day selected';
    const ratio = day.freeSlots / day.totalSlots;
    if (ratio <= 0.33) return 'cal-day low';
    if (ratio <= 0.66) return 'cal-day medium';
    return 'cal-day available';
  }

  private toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onSubmit(): void {
    if (this.isOwner) {
      if (!this.petId || !this.veterinarianId || !this.selectedDate || !this.selectedSlot || !this.reason) {
        this.errorMessage = 'Por favor completa todos los campos.';
        return;
      }
      this.datetime = `${this.selectedDate}T${this.selectedSlot}`;
    } else {
      if (!this.petId || !this.veterinarianId || !this.datetime || !this.reason) {
        this.errorMessage = 'Por favor completa todos los campos.';
        return;
      }
    }

    this.isSaving     = true;
    this.errorMessage = '';

    const payload: Omit<Appointment, 'id'> = {
      pet_id:           Number(this.petId),
      veterinarian_id:  Number(this.veterinarianId),
      datetime:         this.datetime,
      duration_minutes: this.durationMinutes,
      status:           'scheduled',
      reason:           this.reason
    };

    if (this.isEditMode && this.appointmentId) {
      this.appointmentService.update(this.appointmentId, payload).subscribe({
        next:  () => this.router.navigate(['/appointments', this.appointmentId]),
        error: () => { this.isSaving = false; this.errorMessage = 'Error al actualizar.'; }
      });
    } else {
      this.appointmentService.create(payload).subscribe({
        next:  (appt) => this.router.navigate(['/appointments', appt.id]),
        error: ()     => { this.isSaving = false; this.errorMessage = 'Error al crear.'; }
      });
    }
  }

  goBack(): void { this.router.navigate(['/appointments']); }
}