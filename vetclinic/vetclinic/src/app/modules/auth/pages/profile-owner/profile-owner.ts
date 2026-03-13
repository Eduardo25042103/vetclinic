import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth.model';
import { PaymentMethod } from '../../../../core/models/owner-profile';

@Component({
  selector: 'app-profile-owner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-owner.html',
  styleUrl:    './profile-owner.css'
})
export class ProfileOwnerComponent implements OnInit {
  authUser: AuthUser | null = null;
  isEditing  = false;
  isSaving   = false;
  savedOk    = false;

  editName = '';
  editNum  = '';
  editPayment: PaymentMethod = 'cash';

  readonly paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'card', label: 'Tarjeta', icon: 'bi-credit-card' },
    { value: 'cash', label: 'Efectivo', icon: 'bi-cash-stack'  }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {}

  ngOnInit(): void {
    this.authUser = this.authService.getSession();
    if (!this.authUser || this.authUser.role !== 'owner') {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.resetEditFields();
  }

  startEdit(): void {
    this.resetEditFields();
    this.isEditing = true;
    this.savedOk   = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveChanges(): void {
    if (!this.authUser) return;
    this.isSaving = true;

    this.authService.updateUser(this.authUser.user.id, {
      name: this.editName,
      num:  this.editNum
    }).subscribe({
      next: (updatedUser) => {
        if (!this.authUser) return;
        this.authUser.user = updatedUser;

        if (this.authUser.ownerProfile) {
          this.authService.updateOwnerProfile(
            this.authUser.ownerProfile.id,
            { payment_method_prefer: this.editPayment }
          ).subscribe({
            next: (updatedProfile) => {
              if (!this.authUser) return;
              this.authUser.ownerProfile = updatedProfile;
              this.authService.saveSession(this.authUser);
              this.isSaving  = false;
              this.isEditing = false;
              this.savedOk   = true;
            }
          });
        } else {
          this.authService.saveSession(this.authUser);
          this.isSaving  = false;
          this.isEditing = false;
          this.savedOk   = true;
        }
      },
      error: () => { this.isSaving = false; }
    });
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/']);
  }

  private resetEditFields(): void {
    if (!this.authUser) return;
    this.editName    = this.authUser.user.name;
    this.editNum     = this.authUser.user.num;
    this.editPayment = this.authUser.ownerProfile?.payment_method_prefer ?? 'cash';
  }
}