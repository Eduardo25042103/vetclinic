import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalRecordService } from '../../../../core/services/medical-record.service';
import { PetService } from '../../../../core/services/pet.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MedicalRecord } from '../../../../core/models/medical-record';
import { RecordType } from '../../../../core/models/appointment';
import { Pet } from '../../../../core/models/pet';


export interface RecordTypeOption {
  value: RecordType;
  label: string;
  icon:  string;
  color: string;
}

@Component({
  selector: 'app-history-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-form.html',
  styleUrl:    './history-form.css'
})
export class HistoryForm implements OnInit {
  isEditMode    = false;
  isLoading     = true;
  isSaving      = false;
  errorMessage  = '';
  recordId: number | null = null;

  petId:       number     = 0;
  recordType:  RecordType = 'scheduled';
  diagnosis:   string     = '';
  treatment:   string     = '';
  notes:       string     = '';
  appointmentId: number | null = null;

  pets: Pet[] = [];

  readonly typeOptions: RecordTypeOption[] = [
    { value: 'scheduled', label: 'Programado',  icon: 'bi-calendar-check', color: 'opt-scheduled' },
    { value: 'emergency', label: 'Emergencia',  icon: 'bi-exclamation-circle', color: 'opt-emergency' },
    { value: 'followup',  label: 'Seguimiento', icon: 'bi-arrow-repeat',   color: 'opt-followup'  }
  ];

  constructor(
    private readonly route:         ActivatedRoute,
    private readonly recordService: MedicalRecordService,
    private readonly petService:    PetService,
    private readonly authService:   AuthService,
    private readonly router:        Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session || session.role !== 'vet') {
      this.router.navigate(['/history']);
      return;
    }

    const petIdParam = this.route.snapshot.queryParamMap.get('pet_id');
    if (petIdParam) this.petId = Number(petIdParam);

    const apptIdParam = this.route.snapshot.queryParamMap.get('appointment_id');
    if (apptIdParam) this.appointmentId = Number(apptIdParam);

    this.petService.getAll().subscribe({
      next: (pets) => {
        this.pets = pets;

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.isEditMode = true;
          this.recordId   = Number(id);
          this.recordService.getAll().subscribe({
            next: (records) => {
              const record = records.find((r) => r.id === this.recordId);
              if (record) {
                this.petId         = record.pet_id;
                this.recordType    = record.record_type;
                this.diagnosis     = record.diagnosis;
                this.treatment     = record.treatment;
                this.notes         = record.notes;
                this.appointmentId = record.appointment_id;
              }
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  selectType(t: RecordType): void { this.recordType = t; }

  onSubmit(): void {
    if (!this.petId || !this.diagnosis || !this.treatment) {
      this.errorMessage = 'Por favor completa los campos obligatorios.';
      return;
    }

    const session = this.authService.getSession();
    if (!session?.vetProfile) return;

    this.isSaving     = true;
    this.errorMessage = '';

      const payload: Omit<MedicalRecord, 'id'> = {
        pet_id:         Number(this.petId),
        veterinarian_id: session.vetProfile.id,
        appointment_id: Number(this.appointmentId),
        record_type:    this.recordType,
        diagnosis:      this.diagnosis,
        treatment:      this.treatment,
        notes:          this.notes,
        created_at:     new Date().toISOString()
      };

    if (this.isEditMode && this.recordId) {
      this.recordService.update(this.recordId, payload).subscribe({
        next:  () => this.goBack(),
        error: () => { this.isSaving = false; this.errorMessage = 'Error al actualizar.'; }
      });
    } else {
      this.recordService.create(payload).subscribe({
        next:  () => this.goBack(),
        error: () => { this.isSaving = false; this.errorMessage = 'Error al crear.'; }
      });
    }
  }

  goBack(): void {
    const petId = this.petId || this.route.snapshot.queryParamMap.get('pet_id');
    if (petId) {
      this.router.navigate(['/history'], { queryParams: { pet_id: petId } });
    } else {
      this.router.navigate(['/history']);
    }
  }
}