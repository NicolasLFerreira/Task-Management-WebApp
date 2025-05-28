using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.WebHost.Configuration;
using SDP.TaskManagement.WebHost.Configuration.Middleware;

namespace SDP.TaskManagement.WebHost;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Db context
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString(AppConfigurations.Database.DefaultConnection)));

        // Add services to the container
        builder.Services.AddControllers(options =>
        {
            options.Filters.Add(new ProducesAttribute("application/json"));
        });
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerDocumentation();

        // Add security services
        builder.Services.ConfigureCors();
        builder.Services.AddJwtAuthentication(builder.Configuration);

        // Add dependency injection
        builder.Services.AddDependencyInjection(builder.Configuration);

        var app = builder.Build();

        // Configure the HTTP request pipeline
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Tickaway API");
                options.RoutePrefix = string.Empty;
            });

            // Apply migrations in development
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.Database.Migrate();
            }
        }

        app.UseHttpsRedirection();

        // Middleware
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        // Security
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseCors(AppConfigurations.Cors.DefaultCorsPolicy);

        app.MapControllers();

        // Start app
        app.Run();
    }
}
