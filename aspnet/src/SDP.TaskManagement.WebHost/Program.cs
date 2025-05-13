using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.Configuration;
using Microsoft.IdentityModel.Tokens;

using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.WebHost.Swagger;

using System.Text;
using System.Text.Json.Serialization;
using SDP.TaskManagement.WebHost.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

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
        //builder.Services.ConfigureCors();

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
            app.UseSwaggerUI();

            // Apply migrations in development
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.Database.Migrate();
            }
        }

        // Use custom exception handling middleware
        //app.UseExceptionHandling();
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        app.UseHttpsRedirection();
        app.UseCors(AppConfigurations.Cors.DefaultCorsPolicy);

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}
