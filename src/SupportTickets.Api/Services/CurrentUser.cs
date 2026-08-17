using System.Security.Claims;
using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Services;

public interface ICurrentUser { Guid Id { get; } UserRole Role { get; } }
public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid Id => Guid.Parse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());
    public UserRole Role => Enum.Parse<UserRole>(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role) ?? throw new UnauthorizedAccessException());
}
