using SupportTickets.Api.Domain;
using SupportTickets.Api.Services;

namespace SupportTickets.UnitTests;
public sealed class TicketPolicyTests
{
    [Theory]
    [InlineData(TicketStatus.Open, TicketStatus.InProgress, UserRole.SupportAgent, true)]
    [InlineData(TicketStatus.Open, TicketStatus.Resolved, UserRole.SupportAgent, false)]
    [InlineData(TicketStatus.Resolved, TicketStatus.Closed, UserRole.Customer, true)]
    [InlineData(TicketStatus.Open, TicketStatus.InProgress, UserRole.Customer, false)]
    [InlineData(TicketStatus.Closed, TicketStatus.Open, UserRole.Admin, false)]
    public void Enforces_transition_matrix(TicketStatus from, TicketStatus to, UserRole role, bool expected) => Assert.Equal(expected, TicketPolicy.CanTransition(from, to, role));
}

public sealed class PasswordHasherTests
{
    [Fact] public void Hash_is_salted_and_verifiable() { var sut = new PasswordHasher(); var a = sut.Hash("secret"); var b = sut.Hash("secret"); Assert.NotEqual(a, b); Assert.True(sut.Verify("secret", a)); Assert.False(sut.Verify("wrong", a)); }
}
