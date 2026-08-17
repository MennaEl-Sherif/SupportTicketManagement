namespace SupportTickets.Api.Domain;

public enum UserRole { Admin, SupportAgent, Customer }
public enum TicketStatus { Open, InProgress, Resolved, Closed }
public enum TicketPriority { Low, Medium, High, Critical }
public enum ActivityType { Created, Comment, StatusChanged, PriorityChanged, Assigned, TimeLogged }

public sealed class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Ticket
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public Guid CustomerId { get; set; }
    public AppUser Customer { get; set; } = null!;
    public Guid? AssignedAgentId { get; set; }
    public AppUser? AssignedAgent { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAtUtc { get; set; }
    public List<TicketComment> Comments { get; set; } = [];
    public List<TimeEntry> TimeEntries { get; set; } = [];
    public List<TicketActivity> Activities { get; set; } = [];
}

public sealed class TicketComment
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public Guid AuthorId { get; set; }
    public AppUser Author { get; set; } = null!;
    public required string Body { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class TimeEntry
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public Guid AgentId { get; set; }
    public AppUser Agent { get; set; } = null!;
    public DateOnly WorkDate { get; set; }
    public int DurationMinutes { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class TicketActivity
{
    public long Id { get; set; }
    public int TicketId { get; set; }
    public Guid ActorId { get; set; }
    public AppUser Actor { get; set; } = null!;
    public ActivityType Type { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
