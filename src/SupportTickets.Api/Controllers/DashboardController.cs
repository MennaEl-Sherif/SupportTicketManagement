using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Contracts;
using SupportTickets.Api.Data;
using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Controllers;
[ApiController, Authorize(Roles = "Admin"), Route("api/dashboard")]
public sealed class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<DashboardDto> Get()
    {
        var tickets = db.Tickets.AsNoTracking();
        var resolved = tickets.Where(x => x.ResolvedAtUtc != null);
        var avg = await resolved.AnyAsync() ? await resolved.AverageAsync(x => EF.Functions.DateDiffMinute(x.CreatedAtUtc, x.ResolvedAtUtc!.Value)) / 60d : 0;
        var workload = await db.Users.Where(x => x.Role == UserRole.SupportAgent).Select(a => new AgentWorkloadDto(a.Id, a.Name, tickets.Count(t => t.AssignedAgentId == a.Id && t.Status != TicketStatus.Closed))).ToListAsync();
        var status = await tickets.GroupBy(x => x.Status).ToDictionaryAsync(x => x.Key.ToString(), x => x.Count());
        return new(await tickets.CountAsync(), await tickets.CountAsync(x => x.Status == TicketStatus.Open || x.Status == TicketStatus.InProgress), await tickets.CountAsync(x => x.Priority == TicketPriority.Critical && x.Status != TicketStatus.Closed), Math.Round(avg, 1), workload, status);
    }
}
