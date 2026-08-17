import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule],
  template: `
    <main class="login-shell">
      <section class="brand-panel">
        <div class="brand"><span class="brand-mark">S</span><span>Support Desk</span></div>

        <div class="brand-content">
          <span class="eyebrow">CUSTOMER SUPPORT, ORGANIZED</span>
          <h1>Resolve requests.<br><span>Build trust.</span></h1>
          <p>One secure workspace for customers, support agents, and administrators to keep every request moving.</p>

          <div class="features">
            <div><span class="feature-icon">✓</span><span><b>Clear ownership</b><small>Assign and track every ticket</small></span></div>
            <div><span class="feature-icon">⌁</span><span><b>Complete history</b><small>Comments, activity, and time in one place</small></span></div>
            <div><span class="feature-icon">↗</span><span><b>Faster resolution</b><small>Priorities and workflows that keep teams focused</small></span></div>
          </div>
        </div>

        <p class="copyright">© 2026 Support Desk</p>
      </section>

      <section class="form-panel">
        <div class="login-card">
          <div class="mobile-brand"><span class="brand-mark">S</span>Support Desk</div>
          <span class="welcome-label">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p class="subtitle">Enter your account details to continue.</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Email address</mat-label>
              <input matInput type="email" autocomplete="email" formControlName="email">
              <mat-error *ngIf="form.controls.email.hasError('email')">Enter a valid email address</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" autocomplete="current-password" formControlName="password">
              <mat-error *ngIf="form.controls.password.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div class="error" *ngIf="error" role="alert">
              <span class="error-icon">!</span>
              <p>{{ error }}</p>
            </div>

            <button class="signin" mat-flat-button type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in...' : 'Sign in' }}
              <span *ngIf="!loading">→</span>
            </button>
          </form>

          <div class="security"><span>◆</span>Your session is protected with secure JWT authentication.</div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh}.login-shell{min-height:100vh;display:grid;grid-template-columns:minmax(420px,46%) 1fr;background:#f8fafc}
    .brand-panel{position:relative;display:flex;flex-direction:column;overflow:hidden;padding:38px 54px;color:white;background:radial-gradient(circle at 15% 15%,rgba(59,130,246,.25),transparent 30%),radial-gradient(circle at 85% 80%,rgba(37,99,235,.2),transparent 32%),#0f172a}
    .brand-panel:after{content:'';position:absolute;width:420px;height:420px;right:-210px;top:22%;border:1px solid rgba(148,163,184,.13);border-radius:50%;box-shadow:0 0 0 70px rgba(148,163,184,.035),0 0 0 140px rgba(148,163,184,.025)}
    .brand{display:flex;align-items:center;gap:11px;font-size:18px;font-weight:750;position:relative;z-index:1}.brand-mark{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#60a5fa,#2563eb);color:#fff;font-weight:850;box-shadow:0 8px 20px rgba(37,99,235,.35)}
    .brand-content{position:relative;z-index:1;margin:auto 0;max-width:570px}.eyebrow,.welcome-label{font-size:11px;font-weight:800;letter-spacing:.18em;color:#60a5fa}.brand-content h1{font-size:clamp(44px,5vw,70px);line-height:1.02;letter-spacing:-.055em;margin:18px 0 22px}.brand-content h1 span{color:#60a5fa}.brand-content>p{max-width:520px;color:#cbd5e1;font-size:17px;line-height:1.7}
    .features{display:grid;gap:17px;margin-top:38px}.features>div{display:flex;align-items:center;gap:13px}.feature-icon{display:grid;place-items:center;width:35px;height:35px;border:1px solid rgba(96,165,250,.35);border-radius:10px;background:rgba(59,130,246,.12);color:#93c5fd;font-weight:800}.features b,.features small{display:block}.features b{font-size:14px}.features small{color:#94a3b8;margin-top:2px}.copyright{position:relative;z-index:1;color:#64748b;font-size:12px;margin:0}
    .form-panel{display:grid;place-items:center;padding:44px;background:radial-gradient(circle at 80% 10%,#eef4ff,transparent 34%),#f8fafc}.login-card{width:min(440px,100%)}.mobile-brand{display:none}.welcome-label{color:#2563eb}.login-card h2{font-size:34px;line-height:1.15;letter-spacing:-.035em;color:#0f172a;margin:10px 0}.subtitle{color:#64748b;margin:0 0 30px}
    form{display:grid;gap:8px}mat-form-field{width:100%}.signin{height:52px!important;margin-top:7px;border-radius:11px!important;background:linear-gradient(135deg,#2563eb,#1d4ed8)!important;color:#fff!important;font-size:15px!important;font-weight:700!important;box-shadow:0 10px 24px rgba(37,99,235,.25)!important}.signin span{margin-left:10px;font-size:20px}.signin:disabled{opacity:.55}
    .error{display:flex;gap:10px;align-items:center;padding:11px 13px;margin-bottom:3px;border:1px solid #fecaca;border-radius:9px;background:#fef2f2;color:#b91c1c}.error>span{display:grid;place-items:center;flex:none;width:21px;height:21px;border-radius:50%;background:#dc2626;color:white;font-size:12px;font-weight:800}.error p{margin:0;font-size:13px}.security{display:flex;justify-content:center;align-items:center;gap:7px;color:#94a3b8;font-size:11px;margin-top:24px}.security span{font-size:9px;color:#60a5fa}
    @media(max-width:900px){.login-shell{grid-template-columns:1fr}.brand-panel{display:none}.form-panel{padding:28px;min-height:100vh}.mobile-brand{display:flex;align-items:center;gap:10px;font-weight:750;color:#0f172a;margin-bottom:52px}}
    @media(max-width:500px){.form-panel{display:block;padding:24px 20px}.login-card{margin:auto}.mobile-brand{margin-bottom:58px}.login-card h2{font-size:29px}}
  `]
})
export class LoginComponent {
  error = '';
  loading = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email.trim(), password).subscribe({
  next: () => this.router.navigateByUrl('/tickets'),

  error: response => {
    this.loading = false;

    if (response.status === 401) {
      this.error = 'Incorrect email or password. Please try again.';
    } else if (response.status === 0) {
      this.error =
        'Cannot connect to the server. Make sure the API is running.';
    } else {
      this.error = 'Login failed. Please try again later.';
    }
  }
});
  }
}
