import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthResponse, User } from './models';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'ticket-auth'; private readonly state = signal<AuthResponse | null>(this.read());
  readonly user = computed<User | null>(() => this.state()?.user ?? null); readonly token = computed(() => this.state()?.token ?? null);
  constructor(private http: HttpClient) {}
  login(email: string, password: string) { return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(tap(x => { localStorage.setItem(this.key, JSON.stringify(x)); this.state.set(x); })); }
  logout() { localStorage.removeItem(this.key); this.state.set(null); }
  private read(): AuthResponse | null { try { return JSON.parse(localStorage.getItem(this.key) ?? 'null'); } catch { return null; } }
}
