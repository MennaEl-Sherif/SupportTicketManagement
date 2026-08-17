using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Contracts;
using SupportTickets.Api.Data;
using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Services;

public interface ITicketService
{
    Task<PagedResult<TicketDto>> ListAsync(TicketListQuery query);
    Task<TicketDto> GetAsync(int id);
    Task<TicketDto> CreateAsync(CreateTicketRequest request);
    Task<TicketDto> UpdateAsync(int id, UpdateTicketRequest request);
    Task AddCommentAsync(int id, CommentRequest request);
    Task AddTimeAsync(int id, TimeEntryRequest request);
    Task<IReadOnlyList<TimelineItem>> TimelineAsync(int id);
}

public sealed class TicketService(AppDbContext db, ICurrentUser current) : ITicketService
{
    private IQueryable<Ticket> Visible()
    {
        var query = db.Tickets.AsQueryable();
        return current.Role switch
        {
            UserRole.Customer => query.Where(x => x.CustomerId == current.Id),
            UserRole.SupportAgent => query.Where(x => x.AssignedAgentId == current.Id),
            _ => query
        };
    }

    public async Task<PagedResult<TicketDto>> ListAsync(TicketListQuery q)
    {
        IQueryable<Ticket> query = Visible()
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.AssignedAgent)
            .Include(x => x.TimeEntries);
        if (q.Status is not null) 
            query = query.Where(x => x.Status == q.Status);
        if (q.Priority is not null) 
            query = query.Where(x => x.Priority == q.Priority);
        if (!string.IsNullOrWhiteSpace(q.Search)) 
            query = query.Where(x => x.Title.Contains(q.Search) || x.Description.Contains(q.Search));
        query = q.SortBy.ToLowerInvariant() switch
        {
            "priority" => q.Desc ? query.OrderByDescending(x => x.Priority) : query.OrderBy(x => x.Priority),
            "status" => q.Desc ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "title" => q.Desc ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            _ => q.Desc ? query.OrderByDescending(x => x.CreatedAtUtc) : query.OrderBy(x => x.CreatedAtUtc)
        };
        var page = Math.Max(q.Page, 1); var size = Math.Clamp(q.PageSize, 1, 100);
        var total = await query.CountAsync();
        var entities = await query.Skip((page - 1) * size).Take(size).ToListAsync();
        var items = entities.Select(Map).ToList();
        return new(items, page, size, total);
    }


    public async Task<TicketDto> GetAsync(int id) => Map(await Visible().AsNoTracking().Include(x => x.Customer).Include(x => x.AssignedAgent).Include(x => x.TimeEntries).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Ticket not found."));

    public async Task<TicketDto> CreateAsync(CreateTicketRequest r)
    {
        if (current.Role != UserRole.Customer) throw new UnauthorizedAccessException("Only customers create tickets.");
        var ticket = new Ticket { Title = r.Title.Trim(), Description = r.Description.Trim(), Priority = r.Priority, CustomerId = current.Id };
        db.Tickets.Add(ticket);
        ticket.Activities.Add(Activity(current.Id, ActivityType.Created, "Ticket created"));
        await db.SaveChangesAsync(); return await GetAsync(ticket.Id);
    }

    public async Task<TicketDto> UpdateAsync(int id, UpdateTicketRequest r)
    {
        var ticket = await Visible().FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Ticket not found.");
        if (r.Status is { } status && status != ticket.Status)
        {
            if (!TicketPolicy.CanTransition(ticket.Status, status, current.Role)) throw new InvalidOperationException($"Invalid transition from {ticket.Status} to {status}.");
            ticket.Activities.Add(Activity(current.Id, ActivityType.StatusChanged, $"Status changed from {ticket.Status} to {status}"));
            ticket.Status = status; ticket.ResolvedAtUtc = status == TicketStatus.Resolved ? DateTime.UtcNow : ticket.ResolvedAtUtc;
        }
        if (r.Priority is { } priority && priority != ticket.Priority)
        {
            if (current.Role != UserRole.Admin) throw new UnauthorizedAccessException("Only admins change priority.");
            ticket.Activities.Add(Activity(current.Id, ActivityType.PriorityChanged, $"Priority changed from {ticket.Priority} to {priority}")); ticket.Priority = priority;
        }
        if (r.ChangeAssignment && r.AssignedAgentId != ticket.AssignedAgentId)
        {
            if (current.Role != UserRole.Admin) throw new UnauthorizedAccessException("Only admins assign tickets.");
            if (r.AssignedAgentId is { } agentId && !await db.Users.AnyAsync(x => x.Id == agentId && x.Role == UserRole.SupportAgent && x.IsActive)) throw new ArgumentException("Agent is invalid.");
            ticket.AssignedAgentId = r.AssignedAgentId; ticket.Activities.Add(Activity(current.Id, ActivityType.Assigned, r.AssignedAgentId is null ? "Ticket unassigned" : "Ticket assigned"));
        }
        ticket.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await GetAsync(ticket.Id);
    }

    public async Task AddCommentAsync(int id, CommentRequest r)
    {
        var ticket = await Visible().FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Ticket not found.");
        db.Comments.Add(new() { TicketId = id, AuthorId = current.Id, Body = r.Body.Trim() });
        db.Activities.Add(Activity(current.Id, ActivityType.Comment, "Comment added", id)); await db.SaveChangesAsync();
    }

    public async Task AddTimeAsync(int id, TimeEntryRequest r)
    {
        if (current.Role == UserRole.Customer) throw new UnauthorizedAccessException("Customers cannot log time.");
        var ticket = await Visible().FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Ticket not found.");
        if (ticket.Status is TicketStatus.Resolved or TicketStatus.Closed)
            throw new InvalidOperationException("Time cannot be logged on a resolved or closed ticket.");
        db.TimeEntries.Add(new() { TicketId = id, AgentId = current.Id, WorkDate = r.WorkDate, DurationMinutes = r.DurationMinutes, Description = r.Description.Trim() });
        db.Activities.Add(Activity(current.Id, ActivityType.TimeLogged, $"Logged {r.DurationMinutes} minutes", id)); await db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<TimelineItem>> TimelineAsync(int id)
    {
        _ = await Visible().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("Ticket not found.");
        return await db.Activities.AsNoTracking().Where(x => x.TicketId == id).OrderByDescending(x => x.CreatedAtUtc).Select(x => new TimelineItem(x.Id, x.Type, x.Description, x.Actor.Name, x.CreatedAtUtc)).ToListAsync();
    }

    private static TicketActivity Activity(Guid actor, ActivityType type, string description, int ticketId = 0) => new() { ActorId = actor, Type = type, Description = description, TicketId = ticketId };
    private static TicketDto Map(Ticket x) => new(x.Id, x.Title, x.Description, x.Status, x.Priority, x.CustomerId, x.Customer.Name, x.AssignedAgentId, x.AssignedAgent == null ? null : x.AssignedAgent.Name, x.CreatedAtUtc, x.UpdatedAtUtc, x.ResolvedAtUtc, x.TimeEntries.Sum(t => t.DurationMinutes));
}
