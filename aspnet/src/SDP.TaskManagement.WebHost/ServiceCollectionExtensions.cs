using Microsoft.OpenApi.Models;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Services.Auth;
using SDP.TaskManagement.Infrastructure.Managers;
using SDP.TaskManagement.Infrastructure.Repository;

using System.Reflection;

namespace SDP.TaskManagement.WebHost;

/// <summary>
/// Extensions for WebApplicationBuilder.Services
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Handles dependency injection registration.
    /// </summary>
    public static IServiceCollection RegisterInfrastructureDependencyInjection(this IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserManager, UserManager>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }

    /// <summary>
    /// Handles the Swagger setup.
    /// </summary>
    public static void SwaggerHandler(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
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
    }
}
