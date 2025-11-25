import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface User {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  admin: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  profileForm: FormGroup;
  currentUser: User | null = null;
  isSaving = false;

  constructor() {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    //Obtener usuario desde localStorage
    const rawUser = this.authService.getUserFromStorage();

    if (!rawUser) {
      //Si no hay sesión, lo mandamos al login
      this.router.navigate(['/login']);
      return;
    }

    //Guardamos en currentUser tipado
    this.currentUser = {
      id: rawUser.id,
      nombre: rawUser.nombre,
      email: rawUser.email,
      activo: rawUser.activo,
      admin: rawUser.admin,
    };

    //Rellenar el formulario
    this.profileForm.patchValue({
      nombre: this.currentUser.nombre,
      email: this.currentUser.email,
      password: '',
    });
  }

  onSubmit() {
    if (this.profileForm.invalid || !this.currentUser) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.profileForm.value;

    //Arma el payload para el backend
    const updatedData = {
      id: this.currentUser.id,
      nombre: formValue.nombre,
      email: formValue.email,
      activo: this.currentUser.activo,
      admin: this.currentUser.admin,
      // Solo mandamos password si escribieron algo; si va null/"" el back igual lo ignora
      password: formValue.password ? formValue.password : '',
    };

    console.log('Enviando actualización:', updatedData);

    this.authService.updateUser(this.currentUser.id, updatedData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);

        // Si el backend devuelve { message, user: {...} }
        const updatedUser = response.user ?? response;

        // Actualizamos storage y memoria
        this.authService.saveUserToStorage(updatedUser);
        this.currentUser = {
          id: updatedUser.id,
          nombre: updatedUser.nombre,
          email: updatedUser.email,
          activo: updatedUser.activo,
          admin: updatedUser.admin,
        };

        alert('Perfil actualizado correctamente.');
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        const msg = err?.error?.message || 'Hubo un error al guardar los cambios.';
        alert(msg);
        this.isSaving = false;
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
