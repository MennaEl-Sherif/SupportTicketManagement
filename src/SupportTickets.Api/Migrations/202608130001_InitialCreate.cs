using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SupportTickets.Api.Data;

#nullable disable

namespace SupportTickets.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202608130001_InitialCreate")]
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Users", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Tickets",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AssignedAgentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                ResolvedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Tickets", x => x.Id);
                table.ForeignKey("FK_Tickets_Users_CustomerId", x => x.CustomerId, "Users", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_Tickets_Users_AssignedAgentId", x => x.AssignedAgentId, "Users", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Comments",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                TicketId = table.Column<int>(type: "int", nullable: false),
                AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Comments", x => x.Id);
                table.ForeignKey("FK_Comments_Tickets", x => x.TicketId, "Tickets", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_Comments_Users", x => x.AuthorId, "Users", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "TimeEntries",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                TicketId = table.Column<int>(type: "int", nullable: false),
                AgentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                WorkDate = table.Column<DateOnly>(type: "date", nullable: false),
                DurationMinutes = table.Column<int>(type: "int", nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TimeEntries", x => x.Id);
                table.ForeignKey("FK_TimeEntries_Tickets", x => x.TicketId, "Tickets", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_TimeEntries_Users", x => x.AgentId, "Users", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Activities",
            columns: table => new
            {
                Id = table.Column<long>(type: "bigint", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                TicketId = table.Column<int>(type: "int", nullable: false),
                ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Activities", x => x.Id);
                table.ForeignKey("FK_Activities_Tickets", x => x.TicketId, "Tickets", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_Activities_Users", x => x.ActorId, "Users", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(name: "IX_Users_Email", table: "Users", column: "Email", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Tickets_CustomerId", table: "Tickets", column: "CustomerId");
        migrationBuilder.CreateIndex(name: "IX_Tickets_AssignedAgentId", table: "Tickets", column: "AssignedAgentId");
        migrationBuilder.CreateIndex(name: "IX_Comments_TicketId", table: "Comments", column: "TicketId");
        migrationBuilder.CreateIndex(name: "IX_Comments_AuthorId", table: "Comments", column: "AuthorId");
        migrationBuilder.CreateIndex(name: "IX_TimeEntries_TicketId", table: "TimeEntries", column: "TicketId");
        migrationBuilder.CreateIndex(name: "IX_TimeEntries_AgentId", table: "TimeEntries", column: "AgentId");
        migrationBuilder.CreateIndex(name: "IX_Activities_TicketId", table: "Activities", column: "TicketId");
        migrationBuilder.CreateIndex(name: "IX_Activities_ActorId", table: "Activities", column: "ActorId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Activities");
        migrationBuilder.DropTable(name: "Comments");
        migrationBuilder.DropTable(name: "TimeEntries");
        migrationBuilder.DropTable(name: "Tickets");
        migrationBuilder.DropTable(name: "Users");
    }
}
