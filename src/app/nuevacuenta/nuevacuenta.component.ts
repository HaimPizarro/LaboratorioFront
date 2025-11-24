import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // <--- 1. Importar el servicio

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevacuenta.component.html',
})
export class NuevaCuentaComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: FormGroup;
  errorMessage: string = '';

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      const formValue = this.registerForm.value;

      // 3. Construimos el objeto exacto que espera Java
      const nuevoUsuario = {
        nombre: formValue.nombre,
        email: formValue.email,
        password: formValue.password,
        activo: true,
        admin: false,
        createdAt: new Date()
      };

      // 4. Llamada al Backend
      this.authService.register(nuevoUsuario).subscribe({
        next: (response) => {
          console.log('Usuario creado:', response);
          alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.errorMessage = 'Error al crear cuenta. Es posible que el correo ya esté registrado.';
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
