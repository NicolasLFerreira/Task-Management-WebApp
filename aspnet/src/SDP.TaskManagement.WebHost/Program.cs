using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.Configuration;
using Microsoft.IdentityModel.Tokens;

using SDP.TaskManagement.Infrastructure.Persistence;

using System.Text;

namespace SDP.TaskManagement.WebHost;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Db context
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString(AppConfigurations.Database.DefaultConnection)));

        // Jwt auth
        // Sets the configuration for Jwt validation.
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration[AppConfigurations.Jwt.Issuer],
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration[AppConfigurations.Jwt.Audience],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration[AppConfigurations.Jwt.Key] ?? throw new InvalidConfigurationException("Jwt key not present."))),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        // Add services to the container.
        builder.Services.AddControllers();

        // Extensions
        builder.Services
            .ConfigureCors()
            .AddSwaggerConfiguration()
            .AddDependencyInjection();

        var app = builder.Build();

        app.UseCors(AppConfigurations.Cors.DefaultCorsPolicy);

        // Development settings
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskManagement API");
                options.RoutePrefix = string.Empty;
            });

            // For local database creation.
            using (var serviceScope = app.Services.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
                context.Database.Migrate();
            }
        }

        // Middleware
        app.UseHttpsRedirection();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();

        // docker run -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=devlocal123 -e POSTGRES_DB=taskmanagementdb -p 5432:5432 -d postgres:latest
    }
}
