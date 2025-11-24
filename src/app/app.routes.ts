import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },

  {
    path: 'recuperar-password',
    loadComponent: () => import('./recuperar/recuperar.component').then(m => m.RecuperarComponent)
  },

  {
    path: 'nuevo-usuario',
    loadComponent: () => import('./nuevacuenta/nuevacuenta.component').then(m => m.NuevaCuentaComponent)
  },

  {
    path: 'admin-profile',
    loadComponent: () => import('./admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
  },

  { path: '**', redirectTo: 'login' }
];
