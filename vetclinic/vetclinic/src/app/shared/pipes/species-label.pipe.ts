import { Pipe, PipeTransform } from '@angular/core';
import { PetSpecies } from '../../core/models/pet';

@Pipe({ name: 'speciesLabel', standalone: true })
export class SpeciesLabelPipe implements PipeTransform {
  private readonly speciesMap: Record<PetSpecies, string> = {
    dog:   'Perro',
    cat:   'Gato',
    bunny: 'Conejo'
  };

  transform(value: PetSpecies): string {
    return this.speciesMap[value] ?? value;
  }
}