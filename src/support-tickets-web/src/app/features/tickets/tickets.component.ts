import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/auth.service';
import { Ticket, User } from '../../core/models';
import { LogTimeRequest, TicketService, UpdateTicketRequest } from '../../core/ticket.service';

type TicketEdit = { status: string; priority: string; assignedAgentId: string | null };
type TimeEdit = { workDate: string; durationMinutes: number | null; description: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatToolbarModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatChipsModule],
  template: `
    <mat-toolbar class="topbar">
      <span class="brand"><span class="brand-mark">S</span>Support Desk</span><span class="spacer"></span>
      <a mat-button class="dashboard-link" routerLink="/dashboard" *ngIf="isAdmin"><span class="dashboard-icon">▦</span>Dashboard</a>
      <span class="role-badge">{{auth.user()?.role}}</span><span class="user-name">{{ auth.user()?.name }}</span>
      <button mat-button class="logout-btn" (click)="logout()"><span class="logout-icon">↗</span><span>Sign out</span></button>
    </mat-toolbar>

    <main>
      <section class="hero">
        <div><span class="eyebrow">WORKSPACE</span><h1>Ticket management</h1><p>Track every customer request from first response to resolution.</p></div>
        <div class="summary"><div><strong>{{tickets.length}}</strong><span>Visible</span></div><div><strong>{{activeCount}}</strong><span>Active</span></div><div class="critical-summary"><i>!</i><strong>{{criticalCount}}</strong><span>Critical</span></div></div>
      </section>

      <mat-card class="create panel" *ngIf="auth.user()?.role === 'Customer'">
        <mat-card-title>Start a new request</mat-card-title><mat-card-subtitle>Tell the support team what you need help with.</mat-card-subtitle>
        <form [formGroup]="createForm" (ngSubmit)="create()">
          <mat-form-field><mat-label>Title</mat-label><input matInput formControlName="title"></mat-form-field>
          <mat-form-field><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
          <mat-form-field><mat-label>Priority</mat-label><mat-select formControlName="priority"><mat-option *ngFor="let p of priorities" [value]="p">{{p}}</mat-option></mat-select></mat-form-field>
          <button mat-flat-button color="primary">Create ticket</button>
        </form>
      </mat-card>

      <p class="notice" *ngIf="message">{{ message }}</p>
      <mat-card class="panel list-panel">
        <form class="filters" [formGroup]="filters" (ngSubmit)="load()">
          <mat-form-field><mat-label>Search</mat-label><input matInput formControlName="search"></mat-form-field>
          <mat-form-field><mat-label>Status</mat-label><mat-select formControlName="status"><mat-option value="">All</mat-option><mat-option *ngFor="let s of statuses" [value]="s">{{s}}</mat-option></mat-select></mat-form-field>
          <button mat-flat-button color="primary">Apply filters</button>
        </form>

        <div class="ticket-grid">
          <mat-card
           class="ticket"
          *ngFor="let ticket of tickets"
          [class.critical-ticket]="ticket.priority === 'Critical'"
          [class.closed-ticket]="ticket.status === 'Closed'">
            <div class="ticket-title"><div><small class="ticket-id">TICKET #{{ticket.id}}</small><h2>{{ticket.title}}</h2><p>{{ticket.description}}</p></div><span class="priority" [ngClass]="'priority-' + ticket.priority.toLowerCase()">{{ticket.priority}}</span></div>
            <div class="meta"><span><b>Customer</b>{{ticket.customerName}}</span><span><b>Assigned to</b>{{ticket.assignedAgentName || 'Unassigned'}}</span><span><b>Time logged</b>{{ticket.totalMinutes}} min</span><span class="status" [ngClass]="'status-' + ticket.status.toLowerCase()">{{ticket.status}}</span></div>

            <section class="admin-controls"*ngIf="canManage(ticket) && ticket.status !== 'Closed'">
              <mat-form-field><mat-label>Status</mat-label><mat-select [(ngModel)]="edits[ticket.id].status" [ngModelOptions]="{standalone:true}"><mat-option *ngFor="let s of allowedStatuses(ticket)" [value]="s">{{s}}</mat-option></mat-select></mat-form-field>
              <mat-form-field *ngIf="isAdmin"><mat-label>Priority</mat-label><mat-select [(ngModel)]="edits[ticket.id].priority" [ngModelOptions]="{standalone:true}"><mat-option *ngFor="let p of priorities" [value]="p">{{p}}</mat-option></mat-select></mat-form-field>
              <mat-form-field *ngIf="isAdmin"><mat-label>Assigned agent</mat-label><mat-select [(ngModel)]="edits[ticket.id].assignedAgentId" [ngModelOptions]="{standalone:true}"><mat-option [value]="null">Unassigned</mat-option><mat-option *ngFor="let agent of agents" [value]="agent.id">{{agent.name}}</mat-option></mat-select></mat-form-field>
              <button mat-flat-button color="primary" (click)="save(ticket)" [disabled]="savingId === ticket.id">{{savingId === ticket.id ? 'Saving…' : 'Save changes'}}</button>
            </section>
           <div class="closed-info" *ngIf="ticket.status === 'Closed'">
             <span class="closed-icon">✓</span>

            <div>
              <strong>Ticket closed</strong>
             <p>This request is complete and no further changes are available.</p>
            </div>

            <span class="closed-agent"> Handled by<b>{{ ticket.assignedAgentName || 'Unassigned' }}</b></span>
            </div>
            <section class="time-controls" *ngIf="canLogTime(ticket)">
              <h3>Log work time</h3>
              <div class="time-form">
                <mat-form-field>
                  <mat-label>Work date</mat-label>
                  <input matInput type="date" [(ngModel)]="timeEdits[ticket.id].workDate" [ngModelOptions]="{standalone:true}">
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Duration (minutes)</mat-label>
                  <input matInput type="number" min="1" max="1440" [(ngModel)]="timeEdits[ticket.id].durationMinutes" [ngModelOptions]="{standalone:true}">
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Work description</mat-label>
                  <textarea matInput maxlength="500" [(ngModel)]="timeEdits[ticket.id].description" [ngModelOptions]="{standalone:true}"></textarea>
                </mat-form-field>
                <button mat-stroked-button color="primary" (click)="logTime(ticket)" [disabled]="loggingTimeId === ticket.id">
                  {{loggingTimeId === ticket.id ? 'Logging...' : 'Log time'}}
                </button>
              </div>
              <p class="field-error" *ngIf="timeErrors[ticket.id]">{{timeErrors[ticket.id]}}</p>
            </section>
            <p *ngIf="!canManage(ticket)">Status: <strong>{{ticket.status}}</strong><br>Agent: {{ticket.assignedAgentName || 'Unassigned'}}</p>
          </mat-card>
        </div>
        <p *ngIf="!tickets.length" class="empty">No tickets match your filters.</p>
      </mat-card>
    </main>`,
  styles: [`
    :host{display:block;min-height:100vh;background:linear-gradient(180deg,#eef4ff 0,#f8fafc 380px)}
    .topbar{position:sticky;top:0;z-index:20;background:rgba(15,23,42,.96);color:white;padding:0 max(24px,calc((100vw - 1180px)/2));box-shadow:0 8px 30px rgba(15,23,42,.14)}
    .brand{display:flex;align-items:center;gap:10px;font-weight:750}.brand-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#60a5fa,#2563eb);font-weight:800}.spacer{flex:1}.dashboard-link{display:inline-flex!important;align-items:center;gap:7px!important;margin-right:5px;color:#dbeafe!important;background:rgba(59,130,246,.14)!important;border:1px solid rgba(96,165,250,.32)!important;border-radius:10px!important;padding:0 13px!important}.dashboard-link:hover{color:white!important;background:#2563eb!important}.dashboard-icon{font-size:18px}.role-badge{font-size:11px;text-transform:uppercase;letter-spacing:.08em;background:#334155;padding:5px 9px;border-radius:999px;margin:0 12px}.user-name{font-size:14px;margin-right:12px}.logout-btn{display:inline-flex!important;align-items:center;gap:7px!important;color:#fecaca!important;background:rgba(239,68,68,.1)!important;border:1px solid rgba(248,113,113,.3)!important;border-radius:10px!important;padding:0 13px!important;transition:background .18s,border-color .18s,transform .18s!important}.logout-btn:hover{color:#fff!important;background:#dc2626!important;border-color:#ef4444!important;transform:translateY(-1px)}.logout-icon{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:6px;background:rgba(248,113,113,.15);font-size:15px;font-weight:800;transform:rotate(45deg)}
    main{max-width:1180px;margin:auto;padding:42px 28px 64px}.hero{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:28px}.eyebrow{font-size:11px;font-weight:800;letter-spacing:.18em;color:#2563eb}h1{font-size:40px;line-height:1.1;letter-spacing:-.04em;margin:7px 0}.hero p{color:#64748b;margin:0;font-size:16px}
    .summary{display:flex;gap:10px}.summary div{position:relative;min-width:92px;padding:14px 18px;border:1px solid #dbe5f3;border-radius:15px;background:rgba(255,255,255,.78);box-shadow:0 5px 20px rgba(15,23,42,.05)}.summary strong,.summary span{display:block}.summary strong{font-size:25px}.summary span{font-size:12px;color:#64748b}.summary .critical-summary{overflow:hidden;border-color:#fecaca;background:linear-gradient(145deg,#fff,#fff1f2);box-shadow:0 8px 24px rgba(220,38,38,.11)}.critical-summary:after{content:'';position:absolute;width:52px;height:52px;right:-23px;bottom:-25px;border-radius:50%;background:rgba(239,68,68,.12)}.critical-summary i{position:absolute;top:11px;right:11px;display:grid;place-items:center;width:20px;height:20px;border-radius:7px;background:#fee2e2;color:#dc2626;font-size:11px;font-style:normal;font-weight:900}.critical-summary strong{color:#b91c1c}.critical-summary span{color:#dc2626;font-weight:750}
    .panel{border:1px solid #e2e8f0;border-radius:18px!important;box-shadow:0 12px 40px rgba(15,23,42,.07)!important;background:rgba(255,255,255,.94)}.create{margin:20px 0;padding:24px}.create form{display:grid;grid-template-columns:2fr 3fr 1fr auto;gap:12px;align-items:start;margin-top:18px}
    .filters{display:flex;gap:12px;padding:20px 20px 4px;align-items:start;border-bottom:1px solid #edf2f7}.ticket-grid{display:grid;gap:16px;padding:20px}.ticket{padding:22px;border:1px solid #e2e8f0;border-radius:15px!important;box-shadow:0 3px 14px rgba(15,23,42,.04)!important;transition:.18s}.ticket:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(15,23,42,.09)!important}.critical-ticket{border-left:4px solid #dc2626}
    .ticket-title{display:flex;justify-content:space-between;gap:16px}.ticket-title h2{margin:5px 0;font-size:21px}.ticket-title p{color:#64748b;margin:7px 0;line-height:1.55}.ticket-id{font-weight:800;color:#2563eb;letter-spacing:.08em}.priority,.status{display:inline-flex;align-items:center;height:27px;padding:0 10px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase}.priority-low{background:#ecfdf5;color:#047857}.priority-medium{background:#eff6ff;color:#1d4ed8}.priority-high{background:#fff7ed;color:#c2410c}.priority-critical{background:#fef2f2;color:#b91c1c}
    .meta{display:flex;align-items:center;gap:28px;color:#334155;margin:18px 0}.meta span:not(.status){font-size:13px}.meta b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-bottom:3px}.status-open{background:#eff6ff;color:#1d4ed8}.status-inprogress{background:#fff7ed;color:#b45309}.status-resolved{background:#ecfdf5;color:#047857}.status-closed{background:#f1f5f9;color:#475569}
    .admin-controls{display:grid;grid-template-columns:1fr 1fr 1.4fr auto;gap:12px;align-items:start;border-top:1px solid #e2e8f0;padding-top:18px}.time-controls{border-top:1px solid #e2e8f0;margin-top:16px;padding-top:18px}.time-controls h3{margin:0 0 12px}.time-form{display:grid;grid-template-columns:1fr 1fr 2fr auto;gap:12px;align-items:start}.field-error{color:#b91c1c;margin-top:0}
    .notice{background:#dcfce7;color:#166534;padding:13px 16px;border:1px solid #bbf7d0;border-radius:10px}.empty{text-align:center;padding:54px;color:#64748b}
    .closed-ticket {border-color: #cbd5e1 !important;border-left: 4px solid #64748b !important;background:linear-gradient(145deg, #ffffff, #f8fafc) !important;opacity: 0.92;}
    .closed-ticket .ticket-title h2 {color: #475569;}
    .closed-ticket .ticket-title p {color: #94a3b8;}
    .closed-info {display: flex;align-items: center;gap: 13px;padding: 15px 17px;margin-top: 17px;border: 1px solid #d1fae5;border-radius: 12px;background: linear-gradient(135deg, #ecfdf5, #f0fdf4);}
    .closed-icon {display: grid;place-items: center;flex: none;width: 35px;height: 35px;border-radius: 50%;background: #059669;color: white;font-size: 18px;font-weight: 900;}
    .closed-info strong {color: #065f46;font-size: 14px;}
    .closed-info p {margin: 3px 0 0;color: #6b7280;font-size: 11px;}
    .closed-agent {margin-left: auto;color: #64748b;font-size: 10px;text-align: right;text-transform: uppercase;letter-spacing: 0.05em;}
    .closed-agent b {display: block;margin-top: 3px;color: #334155;font-size: 12px;text-transform: none;}

    @media (max-width: 600px) {.closed-info {align-items: flex-start;flex-wrap: wrap;}.closed-agent {width: 100%;margin-left: 48px;text-align: left;}}
    @media(max-width:850px){.hero{align-items:start;flex-direction:column}.summary{width:100%}.summary div{flex:1}.create form,.admin-controls,.time-form{grid-template-columns:1fr}.filters{display:grid}.meta{flex-wrap:wrap}.user-name{display:none}}
    @media(max-width:520px){main{padding:28px 14px}.summary{display:grid;grid-template-columns:repeat(3,1fr)}.summary div{min-width:0;padding:12px}.role-badge{display:none}h1{font-size:32px}}
  `]
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  agents: User[] = [];
  edits: Record<number, TicketEdit> = {};
  timeEdits: Record<number, TimeEdit> = {};
  timeErrors: Record<number, string> = {};
  statuses = ['Open', 'InProgress', 'Resolved', 'Closed'];
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  savingId?: number;
  loggingTimeId?: number;
  message = '';
  filters = this.fb.nonNullable.group({ search: '', status: '' });
  createForm = this.fb.nonNullable.group({ title: ['', Validators.required], description: ['', Validators.required], priority: 'Medium' });

  constructor(private fb: FormBuilder, public auth: AuthService, private api: TicketService, private router: Router) {}
  get isAdmin() { return this.auth.user()?.role === 'Admin'; }
  get activeCount() { return this.tickets.filter(ticket => ticket.status === 'Open' || ticket.status === 'InProgress').length; }
  get criticalCount() { return this.tickets.filter(ticket => ticket.priority === 'Critical' && ticket.status !== 'Closed').length; }
  canLogTime(ticket: Ticket) {
    return this.auth.user()?.role === 'SupportAgent'
      && ticket.status !== 'Resolved'
      && ticket.status !== 'Closed';
  }

  ngOnInit() {
    if (this.isAdmin) this.api.users().subscribe(users => this.agents = users.filter(x => x.role === 'SupportAgent'));
    this.load();
  }

  load() {
    this.api.list(this.filters.getRawValue()).subscribe(page => {
      this.tickets = page.items;
      this.edits = Object.fromEntries(page.items.map(t => [t.id, { status: t.status, priority: t.priority, assignedAgentId: t.assignedAgentId ?? null }]));
      for (const ticket of page.items) {
        this.timeEdits[ticket.id] ??= { workDate: this.today(), durationMinutes: null, description: '' };
      }
    });
  }

  canManage(ticket: Ticket) {
    const role = this.auth.user()?.role;
    return role === 'Admin' || role === 'SupportAgent';
  }

  allowedStatuses(ticket: Ticket) {
    const transitions: Record<string, string[]> = { Open: ['Open','InProgress'], InProgress: ['InProgress','Open','Resolved'], Resolved: ['Resolved','InProgress','Closed'], Closed: ['Closed'] };
    const allowed = transitions[ticket.status] ?? [ticket.status];
    return this.isAdmin ? allowed : allowed.filter(status => status !== 'Closed');
  }

  save(ticket: Ticket) {
    const edit = this.edits[ticket.id];
    const request: UpdateTicketRequest = { status: edit.status };
    if (this.isAdmin) Object.assign(request, { priority: edit.priority, assignedAgentId: edit.assignedAgentId, changeAssignment: true });
    this.savingId = ticket.id; this.message = '';
    this.api.update(ticket.id, request).subscribe({
      next: () => { this.savingId = undefined; this.message = `Ticket #${ticket.id} updated successfully.`; this.load(); },
      error: error => { this.savingId = undefined; this.message = error.error?.title ?? 'Could not update the ticket.'; }
    });
  }

  logTime(ticket: Ticket) {
    const edit = this.timeEdits[ticket.id];
    if (!edit.workDate || !edit.durationMinutes || edit.durationMinutes < 1 || edit.durationMinutes > 1440 || !edit.description.trim()) {
      this.timeErrors[ticket.id] = 'Enter a work date, duration from 1 to 1440 minutes, and a description.';
      return;
    }

    const request: LogTimeRequest = {
      workDate: edit.workDate,
      durationMinutes: edit.durationMinutes,
      description: edit.description.trim()
    };
    this.loggingTimeId = ticket.id;
    this.timeErrors[ticket.id] = '';
    this.api.logTime(ticket.id, request).subscribe({
      next: () => {
        this.loggingTimeId = undefined;
        this.message = `${request.durationMinutes} minutes logged on ticket #${ticket.id}.`;
        this.timeEdits[ticket.id] = { workDate: this.today(), durationMinutes: null, description: '' };
        this.load();
      },
      error: error => {
        this.loggingTimeId = undefined;
        this.timeErrors[ticket.id] = error.error?.title ?? 'Could not log work time.';
      }
    });
  }

  private today() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  create() {
    if (this.createForm.invalid) return;
    this.api.create(this.createForm.getRawValue()).subscribe(() => { this.createForm.reset({ title:'', description:'', priority:'Medium' }); this.load(); });
  }
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
