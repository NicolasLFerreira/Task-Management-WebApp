using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.Configuration;
using Microsoft.IdentityModel.Tokens;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;
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
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Jwt auth
        // Sets the configuration for Jwt validation.
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration[Configurations.Jwt.Issuer],
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration[Configurations.Jwt.Audience],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration[Configurations.Jwt.Key] ?? throw new InvalidConfigurationException("Jwt key not present."))),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        // Add services to the container.
        builder.Services.AddControllers();

        // Extensions
        builder.Services
            .AddDependencyInjection()
            .AddSwaggerConfiguration();

        // Add CORS policy
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        // Development settings
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskManagement API");
                options.RoutePrefix = string.Empty;
            });

            // For local database creation and seeding
            using (var serviceScope = app.Services.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
                context.Database.Migrate();
                
                // Seed a test user
                SeedTestUser(serviceScope.ServiceProvider).Wait();
            }
        }

        // Middleware
        // Remove HTTPS redirection in Docker environment
        // app.UseHttpsRedirection();
        
        // Use CORS - update to use the "AllowAll" policy
        app.UseCors("AllowAll");
        
        // Add authentication middleware before authorization
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        // Add a health check endpoint
        app.MapGet("/api/health", () => 
        {
            return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        });

        app.Run();
    }

    private static async Task SeedTestUser(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<IUserManager>();
        var testEmail = "test@example.com";

        // Check if test user already exists
        if (!await userManager.DoesEmailExist(testEmail))
        {
            // Create a test user
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = "Test User",
                Email = testEmail,
                PasswordHash = passwordHash
            };

            await userManager.CreateNewUser(user);
            Console.WriteLine($"Test user created: {testEmail} / Password123!");
        }
        else
        {
            Console.WriteLine($"Test user already exists: {testEmail}");
        }
    }
}
