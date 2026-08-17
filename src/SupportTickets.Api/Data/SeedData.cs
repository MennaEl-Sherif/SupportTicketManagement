using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Domain;
using SupportTickets.Api.Services;

namespace SupportTickets.Api.Data;
public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync(); if (await db.Users.AnyAsync()) return;
        var hash = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        db.Users.AddRange(
            new AppUser { Name = "System Admin", Email = "admin@tickets.local", PasswordHash = hash.Hash("Admin123!"), Role = UserRole.Admin },
            new AppUser { Name = "Alex Agent", Email = "agent@tickets.local", PasswordHash = hash.Hash("Agent123!"), Role = UserRole.SupportAgent },
            new AppUser { Name = "Casey Customer", Email = "customer@tickets.local", PasswordHash = hash.Hash("Customer123!"), Role = UserRole.Customer });
        await db.SaveChangesAsync();
    }
}
