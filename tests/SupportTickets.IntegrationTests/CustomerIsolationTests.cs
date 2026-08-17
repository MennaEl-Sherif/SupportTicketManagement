using Microsoft.EntityFrameworkCore;
using SupportTickets.Api.Contracts;
using SupportTickets.Api.Data;
using SupportTickets.Api.Domain;
using SupportTickets.Api.Services;

namespace SupportTickets.IntegrationTests;
public sealed class CustomerIsolationTests
{
    [Fact]
    public async Task Customer_cannot_list_or_fetch_another_customers_ticket()
    {
        var customerA = Guid.NewGuid(); var customerB = Guid.NewGuid();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        await using var db = new AppDbContext(options);
        db.Users.AddRange(User(customerA,"A"), User(customerB,"B"));
        db.Tickets.AddRange(new Ticket { Title="Visible",Description="Own",CustomerId=customerA },new Ticket { Title="Secret",Description="Other",CustomerId=customerB }); await db.SaveChangesAsync();
        var service = new TicketService(db, new FakeCurrentUser(customerA, UserRole.Customer));
        var page = await service.ListAsync(new TicketListQuery());
        Assert.Single(page.Items); Assert.Equal("Visible", page.Items[0].Title);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetAsync(2));
    }
    private static AppUser User(Guid id,string name)=>new(){Id=id,Name=name,Email=$"{name}@test.local",PasswordHash="x",Role=UserRole.Customer};
    private sealed record FakeCurrentUser(Guid Id, UserRole Role) : ICurrentUser;
}
