import { Routes } from '@angular/router';
import { noAuthGuard } from './guards/no-auth.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then( m => m.AuthPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/auth/sign-up/sign-up.page').then( m => m.SignUpPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage),
    canActivate: [authGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/main/home/home.page').then( m => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/main/profile/profile.page').then( m => m.ProfilePage)
  },
];