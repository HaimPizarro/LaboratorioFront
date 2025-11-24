import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  admin: boolean;
  createdAt?: string | Date;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  users: AdminUser[] = [];
  isLoading = false;
  errorMessage = '';

  // Modal edición
  showEditModal = false;
  selectedUser: AdminUser | null = null;
  editForm: FormGroup;
  isSaving = false;

  // Modal eliminación
  showDeleteModal = false;
  userToDelete: AdminUser | null = null;

  constructor() {
    this.editForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
        admin: [false],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    const sessionUser = this.authService.getUserFromStorage();

    if (!sessionUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!sessionUser.admin) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data.map((u: any) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          activo: u.activo,
          admin: u.admin,
          createdAt: u.createdAt,
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.errorMessage =
          err?.error?.message || 'No se pudieron cargar los usuarios.';
        this.toast.error('Error al cargar usuarios');
        this.isLoading = false;
      },
    });
  }

  refreshTable(): void {
    this.loadUsers();
  }

  toggleAdmin(user: AdminUser): void {
    user.admin = !user.admin;
  }

  toggleActivo(user: AdminUser): void {
    user.activo = !user.activo;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (!pass && !confirm) {
      return null;
    }

    return pass === confirm ? null : { mismatch: true };
  }

  openEditModal(user: AdminUser): void {
    this.selectedUser = { ...user };
    this.editForm.setValue({
      nombre: this.selectedUser.nombre,
      email: this.selectedUser.email,
      password: '',
      confirmPassword: '',
      admin: this.selectedUser.admin,
    });
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.showEditModal = true;
    this.isSaving = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editForm.reset();
  }

  isEditFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  saveEdit(): void {
    if (!this.selectedUser || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formValue = this.editForm.value;

    const payload: any = {
      id: this.selectedUser.id,
      nombre: formValue.nombre,
      email: formValue.email,
      activo: this.selectedUser.activo,
      admin: !!formValue.admin,
    };

    if (formValue.password && formValue.password.trim() !== '') {
      payload.password = formValue.password;
    } else {
      payload.password = '';
    }

    this.authService.updateUser(this.selectedUser.id, payload).subscribe({
      next: (resp) => {
        console.log('Usuario actualizado', resp);
        const updated = resp.user ?? resp;

        const idx = this.users.findIndex(
          (u) => u.id === this.selectedUser!.id
        );
        if (idx >= 0) {
          this.users[idx] = {
            ...this.users[idx],
            nombre: updated.nombre,
            email: updated.email,
            activo: updated.activo,
            admin: updated.admin,
            createdAt: updated.createdAt,
          };
        }

        this.isSaving = false;
        this.toast.success('Usuario actualizado correctamente');
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error guardando usuario', err);
        this.errorMessage =
          err?.error?.message || 'No se pudo guardar el usuario.';
        this.toast.error('Error al actualizar el usuario');
        this.isSaving = false;
      },
    });
  }

  openDeleteModal(user: AdminUser): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.errorMessage = '';

    this.authService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(
          (u) => u.id !== this.userToDelete!.id
        );
        this.toast.success('Usuario eliminado correctamente');
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Error eliminando usuario', err);
        this.errorMessage =
          err?.error?.message || 'No se pudo eliminar el usuario.';
        this.toast.error('Error al eliminar el usuario');
        this.cancelDelete();
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
