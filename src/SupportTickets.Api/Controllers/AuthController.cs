using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Contracts;
using SupportTickets.Api.Data;
using SupportTickets.Api.Services;

namespace SupportTickets.Api.Controllers;

[ApiController, Route("api/auth")]
public sealed class AuthController(AppDbContext db, IPasswordHasher hasher, ITokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == request.Email && x.IsActive);
        if (user is null || !hasher.Verify(request.Password, user.PasswordHash)) return Unauthorized();
        var (token, expires) = tokens.Create(user);
        return new LoginResponse(token, expires, new(user.Id, user.Name, user.Email, user.Role));
    }
}
