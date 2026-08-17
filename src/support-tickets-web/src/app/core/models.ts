export type Role = 'Admin' | 'SupportAgent' | 'Customer';
export interface User { id: string; name: string; email: string; role: Role }
export interface AuthResponse { token: string; expiresAtUtc: string; user: User }
export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  customerId: string;
  customerName: string;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  totalMinutes: number;
  createdAtUtc: string;
}
export interface Page<T> { items: T[]; page: number; pageSize: number; totalCount: number }
export interface Dashboard { totalTickets: number; openTickets: number; openCriticalTickets: number; averageResolutionHours: number; agentWorkload: { agentName: string; activeTickets: number }[]; statusCounts: Record<string, number> }
