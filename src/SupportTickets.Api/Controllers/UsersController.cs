using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Contracts;
using SupportTickets.Api.Data;
using SupportTickets.Api.Domain;
using SupportTickets.Api.Services;

namespace SupportTickets.Api.Controllers;
[ApiController, Authorize(Roles = "Admin"), Route("api/users")]
public sealed class UsersController(AppDbContext db, IPasswordHasher hasher) : ControllerBase
{
    [HttpGet] public Task<List<UserDto>> List() => db.Users.AsNoTracking().OrderBy(x => x.Name).Select(x => new UserDto(x.Id, x.Name, x.Email, x.Role)).ToListAsync();
    [HttpPost]
   
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email)) 
            return Conflict(new { title = "Email already exists." });
        var user = new AppUser { Name = request.Name.Trim(), Email = email, PasswordHash = hasher.Hash(request.Password), Role = request.Role };
        db.Users.Add(user); 
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new UserDto(user.Id, user.Name, user.Email, user.Role));
    }
    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> Active(Guid id, [FromBody] bool active)
    { 
        var user = await db.Users.FindAsync(id); 
        if (user is null) return NotFound(); 
        user.IsActive = active; 
        await db.SaveChangesAsync(); 
        return NoContent(); 
    }
}
