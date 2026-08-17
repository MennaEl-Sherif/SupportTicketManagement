using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Services;

public interface ITokenService { (string Token, DateTime Expires) Create(AppUser user); }
public sealed class TokenService(IConfiguration config) : ITokenService
{
    public (string Token, DateTime Expires) Create(AppUser user)
    {
        var expires = DateTime.UtcNow.AddHours(8);
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.Name), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Role, user.Role.ToString()) };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var jwt = new JwtSecurityToken(config["Jwt:Issuer"], config["Jwt:Audience"], claims, expires: expires, signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return (new JwtSecurityTokenHandler().WriteToken(jwt), expires);
    }
}
