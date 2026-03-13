import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth.model';

@Component({
  selector: 'app-profile-vet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-vet.html',
  styleUrl:    './profile-vet.css'
})
export class ProfileVetComponent implements OnInit {
  authUser: AuthUser | null = null;
  isEditing          = false;
  isEditingSchedule  = false;
  isSaving           = false;
  savedOk            = false;

  editName      = '';
  editNum       = '';
  editLicense   = '';
  editSpecialty = '';

  editAvailStart = '08:00';
  editAvailEnd   = '17:00';

  readonly timeOptions: string[] = Array.from({ length: 25 }, (_, i) => {
    const h = String(i).padStart(2, '0');
    return `${h}:00`;
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {}

  ngOnInit(): void {
    this.authUser = this.authService.getSession();
    if (!this.authUser || this.authUser.role !== 'vet') {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.resetEditFields();
  }

  startEdit(): void {
    this.resetEditFields();
    this.isEditing        = true;
    this.isEditingSchedule = false;
    this.savedOk          = false;
  }

  startEditSchedule(): void {
    this.editAvailStart    = this.authUser?.vetProfile?.availability_start ?? '08:00';
    this.editAvailEnd      = this.authUser?.vetProfile?.availability_end   ?? '17:00';
    this.isEditingSchedule = true;
    this.isEditing         = false;
    this.savedOk           = false;
  }

  cancelEdit(): void          { this.isEditing = false; }
  cancelEditSchedule(): void  { this.isEditingSchedule = false; }

  saveChanges(): void {
    if (!this.authUser) return;
    this.isSaving = true;

    this.authService.updateUser(this.authUser.user.id, {
      name: this.editName,
      num:  this.editNum
    }).subscribe({
      next: (updatedUser) => {
        if (!this.authUser) return;
        this.authUser.user = updatedUser;

        if (this.authUser.vetProfile) {
          this.authService.updateVetProfile(
            this.authUser.vetProfile.id,
            { license_number: this.editLicense, specialty: this.editSpecialty }
          ).subscribe({
            next: (updatedVet) => {
              if (!this.authUser) return;
              this.authUser.vetProfile = updatedVet;
              this.authService.saveSession(this.authUser);
              this.isSaving  = false;
              this.isEditing = false;
              this.savedOk   = true;
            }
          });
        } else {
          this.authService.saveSession(this.authUser);
          this.isSaving  = false;
          this.isEditing = false;
          this.savedOk   = true;
        }
      },
      error: () => { this.isSaving = false; }
    });
  }

  saveSchedule(): void {
    if (!this.authUser?.vetProfile) return;
    if (this.editAvailStart >= this.editAvailEnd) {
      alert('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }
    this.isSaving = true;
    this.authService.updateVetProfile(this.authUser.vetProfile.id, {
      availability_start: this.editAvailStart,
      availability_end:   this.editAvailEnd
    }).subscribe({
      next: (updatedVet) => {
        if (!this.authUser) return;
        this.authUser.vetProfile   = updatedVet;
        this.authService.saveSession(this.authUser);
        this.isSaving          = false;
        this.isEditingSchedule = false;
        this.savedOk           = true;
      },
      error: () => { this.isSaving = false; }
    });
  }

  get previewSlots(): string[] {
    const slots: string[] = [];
    if (!this.editAvailStart || !this.editAvailEnd || this.editAvailStart >= this.editAvailEnd) return slots;
    const [sh, sm] = this.editAvailStart.split(':').map(Number);
    const [eh, em] = this.editAvailEnd.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur < end) {
      const h = String(Math.floor(cur / 60)).padStart(2, '0');
      const m = String(cur % 60).padStart(2, '0');
      slots.push(`${h}:${m}`);
      cur += 30;
    }
    return slots;
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/']);
  }

  private resetEditFields(): void {
    if (!this.authUser) return;
    this.editName      = this.authUser.user.name;
    this.editNum       = this.authUser.user.num;
    this.editLicense   = this.authUser.vetProfile?.license_number ?? '';
    this.editSpecialty = this.authUser.vetProfile?.specialty      ?? '';
  }
}