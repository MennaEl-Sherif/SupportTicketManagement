using System.ComponentModel.DataAnnotations;
using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Contracts;

public sealed record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
public sealed record LoginResponse(string Token, DateTime ExpiresAtUtc, UserDto User);
public sealed record UserDto(Guid Id, string Name, string Email, UserRole Role);
public sealed record CreateUserRequest([Required] string Name, [Required, EmailAddress] string Email, [Required, MinLength(8)] string Password, UserRole Role);
public sealed record CreateTicketRequest([Required, StringLength(150)] string Title, [Required, StringLength(4000)] string Description, TicketPriority Priority);
public sealed record UpdateTicketRequest(TicketStatus? Status, TicketPriority? Priority, Guid? AssignedAgentId, bool ChangeAssignment = false);
public sealed record CommentRequest([Required, StringLength(2000)] string Body);
public sealed record TimeEntryRequest(DateOnly WorkDate, [Range(1, 1440)] int DurationMinutes, [Required, StringLength(500)] string Description);
public sealed record TicketListQuery(int Page = 1, int PageSize = 20, TicketStatus? Status = null, TicketPriority? Priority = null, string? Search = null, string SortBy = "createdAt", bool Desc = true);
public sealed record TicketDto(int Id, string Title, string Description, TicketStatus Status, TicketPriority Priority, Guid CustomerId, string CustomerName, Guid? AssignedAgentId, string? AssignedAgentName, DateTime CreatedAtUtc, DateTime UpdatedAtUtc, DateTime? ResolvedAtUtc, int TotalMinutes);
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);
public sealed record TimelineItem(long Id, ActivityType Type, string Description, string ActorName, DateTime CreatedAtUtc);
public sealed record DashboardDto(int TotalTickets, int OpenTickets, int OpenCriticalTickets, double AverageResolutionHours, IReadOnlyList<AgentWorkloadDto> AgentWorkload, IReadOnlyDictionary<string, int> StatusCounts);
public sealed record AgentWorkloadDto(Guid AgentId, string AgentName, int ActiveTickets);
