using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Domain;

namespace SupportTickets.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketComment> Comments => Set<TicketComment>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<TicketActivity> Activities => Set<TicketActivity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        b.Entity<AppUser>().Property(x => x.Role).HasConversion<string>();
        b.Entity<Ticket>().Property(x => x.Status).HasConversion<string>();
        b.Entity<Ticket>().Property(x => x.Priority).HasConversion<string>();
        b.Entity<TicketActivity>().Property(x => x.Type).HasConversion<string>();
        b.Entity<Ticket>().HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Ticket>().HasOne(x => x.AssignedAgent).WithMany().HasForeignKey(x => x.AssignedAgentId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<TicketComment>().HasOne<Ticket>().WithMany(x => x.Comments).HasForeignKey(x => x.TicketId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<TimeEntry>().HasOne<Ticket>().WithMany(x => x.TimeEntries).HasForeignKey(x => x.TicketId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<TicketActivity>().HasOne<Ticket>().WithMany(x => x.Activities).HasForeignKey(x => x.TicketId).OnDelete(DeleteBehavior.Cascade);
    }
}
