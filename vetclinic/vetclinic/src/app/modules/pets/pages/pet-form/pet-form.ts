import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../../../core/services/pet.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Pet, PetSpecies } from '../../../../core/models/pet';

export interface SpeciesOption {
  value: PetSpecies;
  label: string;
  icon:  string;
  color: string;
}

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pet-form.html',
  styleUrl: './pet-form.css'
})
export class PetForm implements OnInit {
  isEditMode   = false;
  isLoading    = false;
  isSaving     = false;
  errorMessage = '';
  petId: number | null = null;

  name:      string     = '';
  breed:     string     = '';
  birthDate: string     = '';
  species:   PetSpecies = 'dog';

  readonly speciesOptions: SpeciesOption[] = [
    { value: 'dog',   label: 'Perro',  icon: 'bi-heart-pulse', color: 'opt-dog'   },
    { value: 'cat',   label: 'Gato',   icon: 'bi-stars',       color: 'opt-cat'   },
    { value: 'bunny', label: 'Conejo', icon: 'bi-flower1',     color: 'opt-bunny' }
  ];

  constructor(
    private readonly route:       ActivatedRoute,
    private readonly petService:  PetService,
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session || session.role === 'vet') {
      this.router.navigate(['/pets']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.petId      = Number(id);
      this.isLoading  = true;
      this.petService.getById(this.petId).subscribe({
        next: (pet) => {
          this.name      = pet.name;
          this.breed     = pet.breed;
          this.birthDate = pet.birth_date;
          this.species   = pet.species;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  selectSpecies(s: PetSpecies): void {
    this.species = s;
  }

  onSubmit(): void {
    if (!this.name || !this.breed || !this.birthDate) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    const session = this.authService.getSession();
    if (!session?.ownerProfile) return;

    this.isSaving    = true;
    this.errorMessage = '';

    const payload: Omit<Pet, 'id'> = {
      name:       this.name,
      breed:      this.breed,
      birth_date: this.birthDate,
      species:    this.species,
      owner_id:   session.ownerProfile.id
    };

    if (this.isEditMode && this.petId) {
      this.petService.update(this.petId, payload).subscribe({
        next:  () => this.router.navigate(['/pets', this.petId]),
        error: () => { this.isSaving = false; this.errorMessage = 'Error al actualizar.'; }
      });
    } else {
      this.petService.create(payload).subscribe({
        next:  (pet) => this.router.navigate(['/pets', pet.id]),
        error: ()    => { this.isSaving = false; this.errorMessage = 'Error al crear.'; }
      });
    }
  }

  goBack(): void { this.router.navigate(['/pets']); }
}