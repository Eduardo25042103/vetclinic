import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalRecord } from '../models/medical-record';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private readonly api = 'http://localhost:3000/medicalRecords';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(this.api);
  }

  getByPet(petId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.api}?pet_id=${petId}`);
  }

  getByVet(vetId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.api}?veterinarian_id=${vetId}`);
  }

  create(record: Omit<MedicalRecord, 'id'>): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(this.api, record);
  }

  update(id: number, record: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.http.patch<MedicalRecord>(`${this.api}/${id}`, record);
  }
}