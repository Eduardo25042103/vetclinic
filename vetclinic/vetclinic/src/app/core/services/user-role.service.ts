import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from '../models/user-role';

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  private readonly api = 'http://localhost:3000/userRoles';

  constructor(private readonly http: HttpClient) {}

  getByUser(userId: number): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.api}?user_id=${userId}`);
  }

  create(userRole: Omit<UserRole, 'id'>): Observable<UserRole> {
    return this.http.post<UserRole>(this.api, userRole);
  }
}