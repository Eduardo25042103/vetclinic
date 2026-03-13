import { Injectable } from '@angular/core';
import { Observable, switchMap, map, throwError } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { OwnerProfileService } from '../../../core/services/owner-profile.service';
import { VeterinarianProfileService } from '../../../core/services/veterinarian-profile.service';
import { UserRoleService } from '../../../core/services/user-role.service';
import { User } from '../../../core/models/user';
import { OwnerProfile, PaymentMethod } from '../../../core/models/owner-profile';
import { VeterinarianProfile } from '../../../core/models/veterinarian-profile';
import { RoleName } from '../../../core/models/role';
import { AuthUser, LoginCredentials, RegisterPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'vc_auth_user';

  constructor(
    private readonly userService:  UserService,
    private readonly ownerService: OwnerProfileService,
    private readonly vetService:   VeterinarianProfileService,
    private readonly roleService:  UserRoleService
  ) {}

  // ── Login ────────────────────────────────────────────────────
  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.userService.getByEmail(credentials.email).pipe(
      switchMap((users) => {
        const user = users[0];
        if (!user) return throwError(() => new Error('Usuario no encontrado'));
        return this.resolveAuthUser(user);
      })
    );
  }

  // ── Register ─────────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<AuthUser> {
    const newUser: Omit<User, 'id'> = {
      name:      payload.name,
      user:      payload.username,
      email:     payload.email,
      num:       payload.num,
      createdAt: new Date().toISOString()
    };

    return this.userService.create(newUser).pipe(
      switchMap((createdUser) => {
        const rolId = payload.role === 'owner' ? 1 : 2;
        return this.roleService.create({ user_id: createdUser.id, rol_id: rolId }).pipe(
          switchMap(() => this.createProfile(createdUser.id, payload.role)),
          switchMap(() => this.resolveAuthUser(createdUser))
        );
      })
    );
  }

  // ── Profile updates ──────────────────────────────────────────
  updateUser(userId: number, data: Partial<User>): Observable<User> {
    return this.userService.update(userId, data);
  }

  updateOwnerProfile(ownerId: number, data: Partial<OwnerProfile>): Observable<OwnerProfile> {
    return this.ownerService.update(ownerId, data);
  }

  updateVetProfile(vetId: number, data: Partial<VeterinarianProfile>): Observable<VeterinarianProfile> {
    return this.vetService.update(vetId, data);
  }

  // ── Session ──────────────────────────────────────────────────
  saveSession(authUser: AuthUser): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(authUser));
  }

  getSession(): AuthUser | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getSession();
  }

  // ── Private helpers ──────────────────────────────────────────
 private resolveAuthUser(user: User): Observable<AuthUser> {
  return this.roleService.getByUser(user.id).pipe(
    switchMap((userRoles) => {
      const rolId = userRoles[0]?.rol_id ?? 1;
      const role: RoleName = rolId === 2 ? 'vet' : 'owner';

      if (role === 'owner') {
        return this.ownerService.getByUser(user.id).pipe(
          map((profiles): AuthUser => ({
            user,
            role,
            ownerProfile: profiles[0]
          }))
        );
      }

      return this.vetService.getByUser(user.id).pipe(
        map((profiles): AuthUser => ({
          user,
          role,
          vetProfile: profiles[0]
        }))
      );
    })
  );
}
  private createProfile(
    userId: number,
    role: RoleName
  ): Observable<OwnerProfile | VeterinarianProfile> {
    if (role === 'owner') {
      return this.ownerService.create({
        user_id:               userId,
        payment_method_prefer: 'cash' as PaymentMethod
      });
    }
    return this.vetService.create({
      user_id:        userId,
      license_number: '',
      specialty:      ''
    });
  }
}