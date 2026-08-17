# Support Ticket Management System

Full-stack technical assessment using ASP.NET Core 8, EF Core/SQL Server, JWT, Swagger, Angular 18, reactive forms, RxJS, and Angular Material.

## Run locally

1. Install SQL Server LocalDB (or replace `DefaultConnection` in `src/SupportTickets.Api/appsettings.json`).
2. Run `dotnet restore`, `dotnet ef database update --project src/SupportTickets.Api`, then `dotnet run --project src/SupportTickets.Api`.
3. In `src/support-tickets-web`, run `npm install` and `npm start`. Configure a development proxy from `/api` to the API URL if the ports differ.

Seed accounts: `admin@tickets.local / Admin123!`, `agent@tickets.local / Agent123!`, and `customer@tickets.local / Customer123!`. Change all development credentials and the JWT key outside local development.

## Security model

Ticket visibility is scoped server-side in `TicketService.Visible`: customers only query tickets whose `CustomerId` matches their JWT subject, and agents only query assigned tickets. The same scoped query protects list, detail, update, comments, time, and timeline endpoints, so changing an ID in an HTTP request cannot bypass isolation. Admin-only operations are checked in both authorization attributes and business logic.

## Tests

Run `dotnet test` for transition, password, and customer-isolation coverage. Run `npm test -- --watch=false` for Angular tests.
