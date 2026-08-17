using System.Net;

namespace SupportTickets.Api.Middleware;
public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Request failed {Method} {Path}", context.Request.Method, context.Request.Path);
            context.Response.StatusCode = ex switch { KeyNotFoundException => 404, UnauthorizedAccessException => 403, ArgumentException or InvalidOperationException => 400, _ => 500 };
            await context.Response.WriteAsJsonAsync(new { status = context.Response.StatusCode, title = context.Response.StatusCode == 500 ? "An unexpected error occurred." : ex.Message });
        }
    }
}
