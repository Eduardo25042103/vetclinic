import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'petAge', standalone: true })
export class PetAgePipe implements PipeTransform {
  transform(birthDate: string): string {
    if (!birthDate) return 'Desconocida';

    const birth = new Date(birthDate);
    const now = new Date();
    const totalMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    if (totalMonths < 1)  return 'Menos de 1 mes';
    if (totalMonths < 12) return `${totalMonths} mes${totalMonths > 1 ? 'es' : ''}`;

    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return m > 0
      ? `${y} año${y > 1 ? 's' : ''} y ${m} mes${m > 1 ? 'es' : ''}`
      : `${y} año${y > 1 ? 's' : ''}`;
  }
}