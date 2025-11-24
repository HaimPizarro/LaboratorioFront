import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar.component.html',
})
export class RecuperarComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  recoverForm: FormGroup;

  constructor() {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    const email = this.recoverForm.get('email')?.value;
    const newPassword = this.recoverForm.get('newPassword')?.value;

    // Llamada real al backend
    this.authService.resetPassword(email, newPassword).subscribe({
      next: (resp) => {
        console.log('Respuesta reset-password:', resp);
        alert('¡Tu contraseña ha sido actualizada correctamente!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al actualizar la contraseña', err);
        const msg = err?.error?.message || 'No se pudo actualizar la contraseña. Verifica el correo ingresado.';
        alert(msg);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recoverForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
