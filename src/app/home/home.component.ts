import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { LabService, Lab } from '../services/lab.service';
import { ToastService } from '../services/toast.service';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface SimpleUser {
  id: number;
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private labService = inject(LabService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  currentUser: CurrentUser | null = null;
  showUserMenu = false;

  labs: Lab[] = [];
  filteredLabs: Lab[] = [];
  isLoadingLabs = false;
  errorMessage = '';

  // Usuarios para el select (solo admin los usa)
  allUsers: SimpleUser[] = [];

  // Modal edición
  showEditModal = false;
  selectedLab: Lab | null = null;
  editForm: FormGroup;
  isSaving = false;

  constructor() {
    this.editForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      location: [''],
      capacity: [0, [Validators.min(0)]],
      active: [true],
      userId: [null],
    });
  }

  ngOnInit(): void {
    const rawUser = this.authService.getUserFromStorage();

    // Si no hay usuario en storage al login
    if (!rawUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Mapear desde el User del back
    this.currentUser = {
      id: rawUser.id,
      name: rawUser.nombre,
      email: rawUser.email,
      role: rawUser.admin ? 'admin' : 'user',
    };

    // Cargar usuarios solo si es admin (para el select)
    if (this.currentUser.role === 'admin') {
      this.loadUsersForSelect();
    }

    this.loadLabs();
  }

  // ===================== USERS PARA SELECT =====================

  loadUsersForSelect(): void {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data.map((u: any) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
        }));
      },
      error: (err) => {
        console.error('Error cargando usuarios para select', err);
        this.toast.error('No se pudieron cargar los usuarios');
      },
    });
  }

  // ===================== LABS =====================

  loadLabs(): void {
    this.isLoadingLabs = true;
    this.errorMessage = '';

    this.labService.getLabs().subscribe({
      next: (data) => {
        this.labs = data;
        this.applyLabFilter();
        this.isLoadingLabs = false;
      },
      error: (err) => {
        console.error('Error cargando laboratorios', err);
        this.errorMessage =
          err?.error?.message || 'No se pudieron cargar los laboratorios.';
        this.toast.error('Error al cargar los laboratorios');
        this.isLoadingLabs = false;
      },
    });
  }

  /**
   * Admin → ve todos los labs.
   * Usuario normal → solo labs donde lab.userId === id usuario logueado.
   */
  applyLabFilter(): void {
    if (!this.currentUser) {
      this.filteredLabs = [];
      return;
    }

    if (this.currentUser.role === 'admin') {
      // Admin ve TODOS
      this.filteredLabs = this.labs;
    } else {
      // Usuario normal: solo labs asignados a su ID
      this.filteredLabs = this.labs.filter(
        (lab) => lab.userId === this.currentUser!.id
      );
    }
  }

  refreshLabs(): void {
    this.loadLabs();
  }

  crearLaboratorio(): void {
    this.toast.info('Funcionalidad de crear laboratorio pendiente');
  }

  // ===================== MODAL EDITAR LAB =====================

  openEditModal(lab: Lab): void {
    this.selectedLab = { ...lab };

    this.editForm.setValue({
      code: lab.code,
      name: lab.name,
      location: lab.location ?? '',
      capacity: lab.capacity ?? 0,
      active: lab.active,
      userId: lab.userId ?? null,
    });

    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.showEditModal = true;
    this.isSaving = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedLab = null;
    this.editForm.reset();
  }

  isEditFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  saveEdit(): void {
    if (!this.selectedLab || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formValue = this.editForm.value;

    const payload: Lab = {
      id: this.selectedLab.id,
      code: formValue.code,
      name: formValue.name,
      location: formValue.location,
      capacity: Number(formValue.capacity ?? 0),
      active: !!formValue.active,
      userId: formValue.userId ?? null,
    };

    this.labService.updateLab(this.selectedLab.id, payload).subscribe({
      next: (resp) => {
        // El back puede devolver { message, lab } o directamente el lab
        const updated: Lab = (resp as any).lab ?? resp;

        //Actualizar el array principal
        const idx = this.labs.findIndex(l => l.id === updated.id);
        if (idx >= 0) {
          this.labs[idx] = { ...this.labs[idx], ...updated };
        }

        //Reaplicar el filtro (admin vs usuario normal)
        this.applyLabFilter();

        //Feedback y cerrar modal
        this.toast.success('Laboratorio actualizado correctamente');
        this.isSaving = false;
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error actualizando laboratorio', err);
        this.errorMessage =
          err?.error?.message || 'No se pudo actualizar el laboratorio.';
        this.toast.error('Error al actualizar el laboratorio');
        this.isSaving = false;
      },
    });
  }


  eliminarLaboratorio(lab: Lab): void {
    if (!confirm(`¿Seguro que deseas eliminar el laboratorio "${lab.name}"?`)) {
      return;
    }

    this.labService.deleteLab(lab.id).subscribe({
      next: () => {
        this.labs = this.labs.filter(l => l.id !== lab.id);
        this.applyLabFilter();
        this.toast.success('Laboratorio eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando laboratorio', err);
        this.toast.error('No se pudo eliminar el laboratorio');
      },
    });
  }

  getUserNameById(userId: number | null | undefined): string {
  if (!userId) {
    return 'Sin asignar';
  }

  const u = this.allUsers.find(x => x.id === userId);
  if (!u) {
    return 'Sin asignar';
  }

  return `${u.nombre} (${u.email})`;
}

  // ===================== MENÚ USUARIO NAVBAR =====================

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  irPerfil(): void {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  irAdministrarCuentas(): void {
    this.showUserMenu = false;
    this.router.navigate(['/admin-profile']);
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
