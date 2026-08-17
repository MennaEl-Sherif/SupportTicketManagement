using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTickets.Api.Contracts;
using SupportTickets.Api.Services;

namespace SupportTickets.Api.Controllers;

[ApiController, Authorize, Route("api/tickets")]
public sealed class TicketsController(ITicketService tickets) : ControllerBase
{
    [HttpGet] 
    public Task<PagedResult<TicketDto>> List([FromQuery] TicketListQuery query) => tickets.ListAsync(query);
    [HttpGet("{id:int}")] 
    public Task<TicketDto> Get(int id) => tickets.GetAsync(id);
    [HttpPost, Authorize(Roles = "Customer")] 
    public async Task<ActionResult<TicketDto>> Create(CreateTicketRequest request) 
    { 
        var result = await tickets.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result); 
    }
    [HttpPatch("{id:int}")] 
    public Task<TicketDto> Update(int id, UpdateTicketRequest request) => tickets.UpdateAsync(id, request);
    
    [HttpPost("{id:int}/comments")] 
    public async Task<IActionResult> Comment(int id, CommentRequest request)
    { 
        await tickets.AddCommentAsync(id, request); return NoContent();
    }
    [HttpPost("{id:int}/time"), Authorize(Roles = "Admin,SupportAgent")] 
    public async Task<IActionResult> Time(int id, TimeEntryRequest request) 
    {
        await tickets.AddTimeAsync(id, request); return NoContent(); 
    }
    [HttpGet("{id:int}/timeline")] 
    public Task<IReadOnlyList<TimelineItem>> Timeline(int id) => tickets.TimelineAsync(id);
}
