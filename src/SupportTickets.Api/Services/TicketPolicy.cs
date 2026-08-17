using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Services;

public static class TicketPolicy
{
    private static readonly Dictionary<TicketStatus, TicketStatus[]> Allowed = new()
    {
        [TicketStatus.Open] = [TicketStatus.InProgress],
        [TicketStatus.InProgress] = [TicketStatus.Resolved, TicketStatus.Open],
        [TicketStatus.Resolved] = [TicketStatus.Closed, TicketStatus.InProgress],
        [TicketStatus.Closed] = []
    };

    public static bool CanTransition(TicketStatus from, TicketStatus to, UserRole role)
    {
        if (from == to) return true;
        if (!Allowed[from].Contains(to)) return false;
        if (to == TicketStatus.Closed) return role == UserRole.Admin;
        return role is UserRole.Admin or UserRole.SupportAgent;
    }
}
