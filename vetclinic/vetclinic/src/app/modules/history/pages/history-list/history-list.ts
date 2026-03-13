import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MedicalRecordService } from '../../../../core/services/medical-record.service';
import { PetService } from '../../../../core/services/pet.service';
import { VeterinarianProfileService } from '../../../../core/services/veterinarian-profile.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MedicalRecord } from '../../../../core/models/medical-record';
import { RecordType } from '../../../../core/models/appointment';
import { Pet } from '../../../../core/models/pet';
import { SpeciesLabelPipe } from '../../../../shared/pipes/species-label.pipe';
import { PetAgePipe } from '../../../../shared/pipes/pet-age.pipe';

export interface RecordRow {
  record:   MedicalRecord;
  petName:  string;
  vetName:  string;
}

export interface RecordTypeOption {
  value: RecordType | 'all';
  label: string;
}

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [CommonModule, SpeciesLabelPipe, PetAgePipe],
  templateUrl: './history-list.html',
  styleUrl:    './history-list.css'
})
export class HistoryList implements OnInit {
  rows:      RecordRow[] = [];
  pet:       Pet | null  = null;
  isLoading = true;
  isVet     = false;

  activeFilter: RecordType | 'all' = 'all';

  readonly filters: RecordTypeOption[] = [
    { value: 'all',       label: 'Todos'       },
    { value: 'scheduled', label: 'Programado'  },
    { value: 'emergency', label: 'Emergencia'  },
    { value: 'followup',  label: 'Seguimiento' }
  ];

  readonly recordTypeLabels: Record<string, string> = {
    scheduled: 'Programado',
    emergency: 'Emergencia',
    followup:  'Seguimiento'
  };

  readonly recordTypeColors: Record<string, string> = {
    scheduled: 'type-scheduled',
    emergency: 'type-emergency',
    followup:  'type-followup'
  };

  constructor(
    private readonly recordService: MedicalRecordService,
    private readonly petService:    PetService,
    private readonly vetService:    VeterinarianProfileService,
    private readonly userService:   UserService,
    private readonly authService:   AuthService,
    private readonly route:         ActivatedRoute,
    private readonly router:        Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session) { this.router.navigate(['/auth/login']); return; }

    this.isVet = session.role === 'vet';

    const petId = Number(this.route.snapshot.queryParamMap.get('pet_id'));

    if (!petId) {
      if (this.isVet) {
        this.loadVetRecords(session.vetProfile!.id);
      } else {
        this.router.navigate(['/pets']);
      }
      return;
    }

    forkJoin({
      pet:     this.petService.getById(petId),
      records: this.recordService.getByPet(petId),
      vets:    this.vetService.getAll(),
      users:   this.userService.getAll()
    }).subscribe({
      next: ({ pet, records, vets, users }) => {
        this.pet  = pet;
        this.rows = this.buildRows(records, vets, users);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private loadVetRecords(vetId: number): void {
    forkJoin({
      records: this.recordService.getByVet(vetId),
      pets:    this.petService.getAll(),
      vets:    this.vetService.getAll(),
      users:   this.userService.getAll()
    }).subscribe({
      next: ({ records, pets, vets, users }) => {
        this.rows = records.map((r) => {
          const pet  = pets.find((p) => p.id === r.pet_id);
          const vet  = vets.find((v) => v.id === r.veterinarian_id);
          const user = users.find((u) => u.id === vet?.user_id);
          return { record: r, petName: pet?.name ?? '—', vetName: user?.name ?? '—' };
        });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private buildRows(
    records: MedicalRecord[],
    vets:    any[],
    users:   any[]
  ): RecordRow[] {
    return records.map((r) => {
      const vet  = vets.find((v) => v.veterinarian_id === r.veterinarian_id);
      const user = users.find((u) => u.user_id === vet?.user_id);
      return {
        record:  r,
        petName: this.pet?.name ?? '—',
        vetName: user?.name ?? '—'
      };
    });
  }

  get filteredRows(): RecordRow[] {
    if (this.activeFilter === 'all') return this.rows;
    return this.rows.filter((r) => r.record.record_type === this.activeFilter);
  }

  setFilter(f: RecordType | 'all'): void { this.activeFilter = f; }

  goToNew(): void {
    const petId = this.route.snapshot.queryParamMap.get('pet_id');
    this.router.navigate(['/history/new'], {
      queryParams: petId ? { pet_id: petId } : {}
    });
  }

  goToEdit(id: number): void  { this.router.navigate(['/history/edit', id]); }
  goBack(): void              { this.router.navigate(['/pets']); }
}