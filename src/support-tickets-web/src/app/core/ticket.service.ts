import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Dashboard, Page, Ticket, User } from './models';

export interface UpdateTicketRequest {
  status?: string;
  priority?: string;
  assignedAgentId?: string | null;
  changeAssignment?: boolean;
}

export interface LogTimeRequest {
  workDate: string;
  durationMinutes: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private http: HttpClient) {}

  list(filters: Record<string, string | number>) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params = params.set(key, value);
    });
    return this.http.get<Page<Ticket>>('/api/tickets', { params });
  }

  create(value: { title: string; description: string; priority: string }) {
    return this.http.post<Ticket>('/api/tickets', value);
  }

  update(id: number, request: UpdateTicketRequest) {
    return this.http.patch<Ticket>(`/api/tickets/${id}`, request);
  }

  logTime(id: number, request: LogTimeRequest) {
    return this.http.post<void>(`/api/tickets/${id}/time`, request);
  }

  users() {
    return this.http.get<User[]>('/api/users');
  }

  dashboard() {
    return this.http.get<Dashboard>('/api/dashboard');
  }
}
