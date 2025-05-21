using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.WebHost.Middleware;

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
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerDocumentation();

        // Configure CORS
        builder.Services.ConfigureCors();

        // Add JWT Authentication
        //builder.Services.AddJwtAuthentication(builder.Configuration);

        // Add dependency injection
        builder.Services.AddDependencyInjection(builder.Configuration);
        builder.Services.ConfigureCors();
        builder.Services.AddJwtAuthentication(builder.Configuration);

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
        app.UseCors(AppConfigurations.Cors.DefaultCorsPolicy);

        // Middleware

        app.UseMiddleware<ExceptionHandlingMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        // Start app
        app.Run();
    }
}
