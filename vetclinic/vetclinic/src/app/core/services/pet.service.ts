import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pet } from '../models/pet';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly api = 'http://localhost:3000/pets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.api);
  }

  getById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.api}/${id}`);
  }

  getByOwner(ownerId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.api}?owner_id=${ownerId}`);
  }

  create(pet: Omit<Pet, 'id'>): Observable<Pet> {
    return this.http.post<Pet>(this.api, pet);
  }

  update(id: number, pet: Partial<Pet>): Observable<Pet> {
    return this.http.patch<Pet>(`${this.api}/${id}`, pet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}