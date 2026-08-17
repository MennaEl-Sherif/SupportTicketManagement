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
    <main class="page">
      <header><span class="logo">S</span><b>Support Desk</b></header>
      <section class="card">
        <div class="accent"></div>
        <div class="heading"><span>WELCOME BACK</span><h1>Sign in to your account</h1><p>Manage tickets, collaborate with your team, and keep customers updated.</p></div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Email address</label>
          <mat-form-field appearance="outline"><input matInput type="email" autocomplete="email" placeholder="name@company.com" formControlName="email"><mat-error>Enter a valid email address</mat-error></mat-form-field>
          <label>Password</label>
          <mat-form-field appearance="outline"><input matInput type="password" autocomplete="current-password" placeholder="Enter your password" formControlName="password"><mat-error>Password is required</mat-error></mat-form-field>
          <div class="error" *ngIf="error"><i>!</i>{{error}}</div>
          <button mat-flat-button class="signin" [disabled]="form.invalid || loading">{{loading ? 'Signing in...' : 'Sign in'}} <b *ngIf="!loading">→</b></button>
        </form>
        <div class="divider"><span>SECURE ACCESS</span></div>
        <p class="security">◆ &nbsp;Protected with JWT authentication and role-based access</p>
      </section>
      <footer>© 2026 Support Desk · Customer support management</footer>
    </main>`,
  styles: [`
    :host{display:block;min-height:100vh}.page{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:88px 22px 35px;background:radial-gradient(circle at 85% 8%,rgba(96,165,250,.22),transparent 28%),radial-gradient(circle at 8% 90%,rgba(37,99,235,.14),transparent 26%),linear-gradient(145deg,#f8fafc,#eef4ff 50%,#f8fafc);color:#0f172a}.page:before{content:'';position:absolute;inset:0;opacity:.28;background-image:linear-gradient(#cbd5e1 1px,transparent 1px),linear-gradient(90deg,#cbd5e1 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(#000,transparent 75%)}
    header{position:absolute;top:28px;z-index:1;display:flex;align-items:center;gap:10px;font-size:18px}.logo{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#60a5fa,#2563eb);color:white;font-weight:850;box-shadow:0 8px 20px rgba(37,99,235,.3)}
    .card{position:relative;z-index:1;width:min(455px,100%);overflow:hidden;padding:38px 40px 30px;border:1px solid rgba(203,213,225,.9);border-radius:22px;background:rgba(255,255,255,.94);box-shadow:0 24px 65px rgba(15,23,42,.13);backdrop-filter:blur(14px)}.accent{position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,#60a5fa,#2563eb,#4f46e5)}
    .heading{text-align:center;margin-bottom:28px}.heading>span{display:inline-block;padding:5px 9px;border-radius:999px;background:#eff6ff;color:#2563eb;font-size:10px;font-weight:850;letter-spacing:.14em}.heading h1{margin:13px 0 8px;font-size:31px;letter-spacing:-.04em}.heading p{margin:auto;color:#64748b;font-size:14px;line-height:1.55}
    form{display:grid}label{margin-bottom:7px;color:#334155;font-size:12px;font-weight:750}mat-form-field{width:100%;margin-bottom:2px}.signin{height:52px!important;margin-top:9px;border-radius:11px!important;background:linear-gradient(135deg,#2563eb,#1d4ed8)!important;color:#fff!important;font-size:15px!important;font-weight:750!important;box-shadow:0 11px 25px rgba(37,99,235,.26)!important}.signin b{margin-left:9px;font-size:19px}.error{display:flex;align-items:center;gap:9px;padding:11px 12px;margin-bottom:3px;border:1px solid #fecaca;border-radius:9px;background:#fef2f2;color:#b91c1c;font-size:13px}.error i{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#dc2626;color:#fff;font-style:normal;font-weight:800}
    .divider{display:flex;align-items:center;gap:10px;margin:25px 0 13px;color:#94a3b8;font-size:9px;font-weight:800;letter-spacing:.15em}.divider:before,.divider:after{content:'';height:1px;flex:1;background:#e2e8f0}.security{text-align:center;color:#94a3b8;font-size:11px;margin:0}footer{z-index:1;margin-top:24px;color:#94a3b8;font-size:11px}@media(max-width:520px){.page{justify-content:flex-start;padding:83px 14px 28px}.card{padding:31px 21px 25px;border-radius:18px}.heading h1{font-size:27px}}
  `]
})
export class SigninComponent {
  error=''; loading=false;
  form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required]});
  constructor(private fb:FormBuilder,private auth:AuthService,private router:Router){}
  submit() {
  if (this.form.invalid || this.loading) return;

  this.error = '';
  this.loading = true;

  const { email, password } = this.form.getRawValue();

  this.auth.login(email.trim(), password).subscribe({
    next: () => this.router.navigateByUrl('/tickets'),

    error: response => {
      this.loading = false;

      if (response.status === 401) {
        this.error = 'Incorrect email or password. Please try again.';
      } else if (response.status === 0) {
        this.error = 'Cannot connect to the server.';
      } else {
        this.error = 'Login failed. Please try again later.';
      }
    }
  });
}
}
