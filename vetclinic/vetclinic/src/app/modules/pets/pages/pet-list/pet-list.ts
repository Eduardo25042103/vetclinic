import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PetService } from '../../../../core/services/pet.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Pet } from '../../../../core/models/pet';
import { SpeciesLabelPipe } from '../../../../shared/pipes/species-label.pipe';
import { PetAgePipe } from '../../../../shared/pipes/pet-age.pipe';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, SpeciesLabelPipe, PetAgePipe],
  templateUrl: './pet-list.html',
  styleUrl: './pet-list.css'
})
export class PetList implements OnInit {
  pets: Pet[] = [];
  isLoading   = true;
  isVet       = false;

  readonly speciesColors: Record<string, string> = {
    dog:   'species-dog',
    cat:   'species-cat',
    bunny: 'species-bunny'
  };

  readonly speciesIcons: Record<string, string> = {
    dog:   'bi-heart-pulse',
    cat:   'bi-stars',
    bunny: 'bi-flower1'
  };

  constructor(
    private readonly petService:  PetService,
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getSession();
    if (!session) { this.router.navigate(['/auth/login']); return; }

    this.isVet = session.role === 'vet';

    if (this.isVet) {
      this.petService.getAll().subscribe({
        next:  (pets) => { this.pets = pets; this.isLoading = false; },
        error: ()     => { this.isLoading = false; }
      });
    } else {
      const ownerId = session.ownerProfile?.id;
      if (!ownerId) { this.isLoading = false; return; }
      this.petService.getByOwner(ownerId).subscribe({
        next:  (pets) => { this.pets = pets; this.isLoading = false; },
        error: ()     => { this.isLoading = false; }
      });
    }
  }

  goToDetail(id: number): void { this.router.navigate(['/pets', id]); }
  goToNew(): void              { this.router.navigate(['/pets/new']); }
  goToEdit(id: number): void   { this.router.navigate(['/pets/edit', id]); }

  confirmDelete(pet: Pet): void {
    if (!confirm(`¿Eliminar a ${pet.name}?`)) return;
    this.petService.delete(pet.id).subscribe(() => {
      this.pets = this.pets.filter((p) => p.id !== pet.id);
    });
  }
}