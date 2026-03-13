import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../core/models/appointment';

@Pipe({ name: 'appointmentStatus', standalone: true })
export class AppointmentStatusPipe implements PipeTransform {
  private readonly statusMap: Record<AppointmentStatus, string> = {
    scheduled: 'Programada',
    ongoing:   'En curso',
    cancelled: 'Cancelada',
    completed: 'Completada'
  };

  transform(value: AppointmentStatus): string {
    return this.statusMap[value] ?? value;
  }
}