import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/auth.service';
import { Dashboard } from '../../core/models';
import { TicketService } from '../../core/ticket.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatCardModule],
  template: `
    <mat-toolbar class="topbar">
      <span class="brand"><span class="brand-mark">S</span>Support Desk</span>
      <span class="spacer"></span>
      <a mat-button class="tickets-link" routerLink="/tickets"><span>☷</span>Tickets</a>
      <span class="role">ADMIN</span><span class="user">{{auth.user()?.name}}</span>
      <button mat-button class="logout" (click)="logout()">Sign out</button>
    </mat-toolbar>

    <main>
      <section class="hero">
        <div><span class="eyebrow">ADMIN OVERVIEW</span><h1>Operations dashboard</h1><p>Monitor support health, workload, and resolution performance.</p></div>
        <div class="live"><i></i>Live overview</div>
      </section>

      <ng-container *ngIf="data; else loading">
        <section class="metrics">
          <mat-card class="metric total"><div class="metric-icon">▤</div><div><span>Total tickets</span><strong>{{data.totalTickets}}</strong><small>Across all customers</small></div></mat-card>
          <mat-card class="metric open"><div class="metric-icon">◷</div><div><span>Active tickets</span><strong>{{data.openTickets}}</strong><small>Open or in progress</small></div></mat-card>
          <mat-card class="metric critical"><div class="metric-icon">!</div><div><span>Open critical</span><strong>{{data.openCriticalTickets}}</strong><small>Require attention</small></div></mat-card>
          <mat-card class="metric resolution"><div class="metric-icon">↗</div><div><span>Avg. resolution</span><strong>{{data.averageResolutionHours}}<em>h</em></strong><small>Across resolved tickets</small></div></mat-card>
        </section>

        <section class="content-grid">
          <mat-card class="panel status-panel">
            <header><div><span class="panel-label">TICKET FLOW</span><h2>Status distribution</h2></div><span class="panel-total">{{data.totalTickets}} total</span></header>
            <div class="chart-layout">
              <div class="donut" [style.background]="donutBackground"><div><strong>{{data.openTickets}}</strong><span>active</span></div></div>
              <div class="status-list">
                <div *ngFor="let item of statusEntries">
                  <div class="status-row"><span><i [class]="'dot dot-' + item.key.toLowerCase()"></i>{{formatStatus(item.key)}}</span><b>{{item.value}}</b></div>
                  <div class="track"><span [class]="'fill fill-' + item.key.toLowerCase()" [style.width.%]="percentage(item.value)"></span></div>
                </div>
              </div>
            </div>
          </mat-card>

          <mat-card class="panel workload-panel">
            <header><div><span class="panel-label">TEAM CAPACITY</span><h2>Agent workload</h2></div></header>
            <div class="agents" *ngIf="data.agentWorkload.length; else noAgents">
              <div class="agent" *ngFor="let agent of data.agentWorkload; let i=index">
                <span class="avatar">{{initials(agent.agentName)}}</span>
                <div class="agent-info"><b>{{agent.agentName}}</b><span>{{agent.activeTickets}} active {{agent.activeTickets === 1 ? 'ticket' : 'tickets'}}</span><div class="capacity"><i [style.width.%]="workloadWidth(agent.activeTickets)"></i></div></div>
                <span class="count">{{agent.activeTickets}}</span>
              </div>
            </div>
            <ng-template #noAgents><p class="empty">No support agents found.</p></ng-template>
          </mat-card>
        </section>

        <section class="insight-strip">
          <div><span class="insight-icon">◎</span><p><b>Current workload</b><span>{{assignedTotal}} active tickets are assigned across {{data.agentWorkload.length}} support agents.</span></p></div>
          <a routerLink="/tickets">Manage tickets <span>→</span></a>
        </section>
      </ng-container>

      <ng-template #loading><div class="loading"><span></span><p>Loading dashboard...</p></div></ng-template>
    </main>`,
  styles: [`
    :host{display:block;min-height:100vh;background:linear-gradient(180deg,#eef4ff 0,#f8fafc 390px);color:#0f172a}.topbar{position:sticky;top:0;z-index:20;padding:0 max(24px,calc((100vw - 1180px)/2));background:rgba(15,23,42,.97);color:#fff;box-shadow:0 8px 30px rgba(15,23,42,.14)}.brand{display:flex;align-items:center;gap:10px;font-weight:750}.brand-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#60a5fa,#2563eb);font-weight:850}.spacer{flex:1}.tickets-link{display:flex!important;gap:7px;color:#dbeafe!important;background:rgba(59,130,246,.14)!important;border:1px solid rgba(96,165,250,.3)!important;border-radius:10px!important}.role{font-size:10px;letter-spacing:.1em;background:#334155;padding:6px 9px;border-radius:999px;margin:0 10px}.user{font-size:13px;margin-right:12px}.logout{color:#fecaca!important;border:1px solid rgba(248,113,113,.28)!important;border-radius:10px!important}.logout:hover{background:#dc2626!important;color:#fff!important}
    main{max-width:1180px;margin:auto;padding:42px 28px 64px}.hero{display:flex;align-items:end;justify-content:space-between;margin-bottom:28px}.eyebrow,.panel-label{font-size:10px;font-weight:850;letter-spacing:.17em;color:#2563eb}.hero h1{font-size:40px;letter-spacing:-.045em;margin:7px 0}.hero p{color:#64748b;margin:0}.live{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid #dbe5f3;border-radius:999px;background:rgba(255,255,255,.8);color:#475569;font-size:12px}.live i{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 4px #dcfce7}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.metric{display:flex;align-items:center;gap:15px;padding:21px;border:1px solid #e2e8f0;border-radius:17px!important;background:rgba(255,255,255,.94);box-shadow:0 8px 26px rgba(15,23,42,.06)!important}.metric-icon{display:grid;place-items:center;flex:none;width:43px;height:43px;border-radius:12px;font-size:20px;font-weight:850}.metric span,.metric strong,.metric small{display:block}.metric span{color:#64748b;font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.05em}.metric strong{font-size:29px;line-height:1.05;margin:5px 0}.metric strong em{font-size:14px;font-style:normal;color:#64748b}.metric small{color:#94a3b8;font-size:10px}.total .metric-icon{background:#eff6ff;color:#2563eb}.open .metric-icon{background:#fff7ed;color:#d97706}.critical .metric-icon{background:#fef2f2;color:#dc2626}.resolution .metric-icon{background:#ecfdf5;color:#059669}
    .content-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:16px;margin-top:16px}.panel{padding:24px;border:1px solid #e2e8f0;border-radius:18px!important;background:rgba(255,255,255,.95);box-shadow:0 10px 34px rgba(15,23,42,.06)!important}.panel header{display:flex;align-items:start;justify-content:space-between;margin-bottom:25px}.panel h2{font-size:20px;margin:5px 0 0}.panel-total{padding:6px 10px;border-radius:999px;background:#f1f5f9;color:#64748b;font-size:11px}.chart-layout{display:grid;grid-template-columns:180px 1fr;gap:28px;align-items:center}.donut{display:grid;place-items:center;width:170px;height:170px;border-radius:50%;position:relative}.donut:after{content:'';position:absolute;width:108px;height:108px;border-radius:50%;background:#fff}.donut div{z-index:1;text-align:center}.donut strong,.donut span{display:block}.donut strong{font-size:30px}.donut span{color:#64748b;font-size:11px;text-transform:uppercase}.status-list{display:grid;gap:15px}.status-row{display:flex;justify-content:space-between;font-size:12px}.status-row span{display:flex;align-items:center;gap:8px}.dot{width:8px;height:8px;border-radius:50%}.dot-open,.fill-open{background:#3b82f6}.dot-inprogress,.fill-inprogress{background:#f59e0b}.dot-resolved,.fill-resolved{background:#10b981}.dot-closed,.fill-closed{background:#94a3b8}.track{height:7px;margin-top:7px;border-radius:999px;background:#f1f5f9;overflow:hidden}.fill{display:block;height:100%;border-radius:999px}
    .agents{display:grid;gap:4px}.agent{display:flex;align-items:center;gap:12px;padding:12px 3px;border-bottom:1px solid #f1f5f9}.agent:last-child{border:0}.avatar{display:grid;place-items:center;width:39px;height:39px;border-radius:11px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#1d4ed8;font-size:12px;font-weight:850}.agent-info{flex:1}.agent-info b,.agent-info span{display:block}.agent-info b{font-size:13px}.agent-info span{color:#94a3b8;font-size:10px;margin:3px 0 7px}.capacity{height:5px;background:#f1f5f9;border-radius:999px;overflow:hidden}.capacity i{display:block;height:100%;background:linear-gradient(90deg,#60a5fa,#2563eb);border-radius:999px}.count{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:850}
    .insight-strip{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:17px 21px;border:1px solid #dbeafe;border-radius:15px;background:#eff6ff}.insight-strip>div{display:flex;align-items:center;gap:12px}.insight-icon{font-size:24px;color:#2563eb}.insight-strip p{margin:0}.insight-strip p b,.insight-strip p span{display:block}.insight-strip p b{font-size:12px}.insight-strip p span{color:#64748b;font-size:11px;margin-top:2px}.insight-strip a{color:#1d4ed8;font-size:12px;font-weight:800;text-decoration:none}.empty{text-align:center;color:#94a3b8;padding:35px}.loading{display:grid;place-items:center;padding:100px;color:#64748b}.loading span{width:32px;height:32px;border:3px solid #dbeafe;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:900px){.metrics{grid-template-columns:1fr 1fr}.content-grid{grid-template-columns:1fr}.user{display:none}}@media(max-width:600px){main{padding:28px 14px}.hero{align-items:start;gap:18px;flex-direction:column}.hero h1{font-size:32px}.metrics{grid-template-columns:1fr}.chart-layout{grid-template-columns:1fr}.donut{margin:auto}.role{display:none}.insight-strip{align-items:start;gap:15px;flex-direction:column}}
  `]
})
export class DashboardComponent implements OnInit {
  data?: Dashboard;
  constructor(private api: TicketService, public auth: AuthService, private router: Router) {}
  ngOnInit() { this.api.dashboard().subscribe(value => this.data = value); }
  get statusEntries() { return Object.entries(this.data?.statusCounts ?? {}).map(([key,value]) => ({key,value})); }
  get assignedTotal() { return this.data?.agentWorkload.reduce((sum,agent) => sum + agent.activeTickets, 0) ?? 0; }
  get donutBackground() { const total=this.data?.totalTickets||1; const open=this.data?.statusCounts['Open']||0; const progress=this.data?.statusCounts['InProgress']||0; const resolved=this.data?.statusCounts['Resolved']||0; const a=open/total*100,b=(open+progress)/total*100,c=(open+progress+resolved)/total*100; return `conic-gradient(#3b82f6 0 ${a}%,#f59e0b ${a}% ${b}%,#10b981 ${b}% ${c}%,#94a3b8 ${c}% 100%)`; }
  percentage(value:number){return this.data?.totalTickets?Math.max(3,value/this.data.totalTickets*100):0;}
  workloadWidth(value:number){const max=Math.max(...(this.data?.agentWorkload.map(x=>x.activeTickets)??[1]),1);return value/max*100;}
  formatStatus(value:string){return value==='InProgress'?'In Progress':value;}
  initials(name:string){return name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();}
  logout(){this.auth.logout();this.router.navigateByUrl('/login');}
}
