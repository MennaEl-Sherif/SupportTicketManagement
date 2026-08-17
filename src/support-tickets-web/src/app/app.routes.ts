import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/signin.component').then(m => m.SigninComponent) },
  { path: 'tickets', canActivate: [authGuard], loadComponent: () => import('./features/tickets/tickets.component').then(m => m.TicketsComponent) },
  { path: 'dashboard', canActivate: [adminGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'tickets' }, { path: '**', redirectTo: 'tickets' }
];
