using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

using SDP.TaskManagement.Infrastructure;
using SDP.TaskManagement.Infrastructure.Persistence;

using System.Reflection;

namespace SDP.TaskManagement.WebHost;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Db context
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // SDP.TaskManagement.Infrastructure DI
        builder.Services.RegisterInfrastructureDependencyInjection();

        // Add services to the container.
        builder.Services.AddControllers();

        // Swagger setup
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "TaskManagementWebApp API",
                Description = "API for our SDP project.",
                Contact = new OpenApiContact
                {
                    Name = "Nicolas Limbeger Ferreira",
                    Url = new Uri("https://github.com/NicolasLFerreira")
                },
                License = new OpenApiLicense
                {
                    Name = "MIT",
                    Url = new Uri("https://opensource.org/licenses/MIT")
                }
            });

            // XML comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);
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

            // For local database creation.
            using (var serviceScope = app.Services.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
                context.Database.Migrate();
            }
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();


        app.MapControllers();

        app.Run();

        // docker run -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=devlocal123 -e POSTGRES_DB=taskmanagementdb -p 5432:5432 -d postgres:latest
    }
}
