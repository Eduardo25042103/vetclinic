import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly api = 'http://localhost:3000/appointments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.api);
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.api}/${id}`);
  }

  getByPet(petId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.api}?pet_id=${petId}`);
  }

  getByVet(vetId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.api}?veterinarian_id=${vetId}`);
  }

  create(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
    return this.http.post<Appointment>(this.api, appointment);
  }

  update(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/${id}`, appointment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}