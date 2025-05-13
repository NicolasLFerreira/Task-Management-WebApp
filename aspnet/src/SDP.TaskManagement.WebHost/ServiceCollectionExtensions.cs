using Microsoft.OpenApi.Models;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Services.Auth;
using SDP.TaskManagement.Infrastructure.Managers;
using SDP.TaskManagement.Infrastructure.Repository;

using System.Reflection;

namespace SDP.TaskManagement.WebHost;

/// <summary>
/// Extensions for WebApplicationBuilder.Services to be used in Program.cs
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Handles dependency injection registration for the application.
    /// </summary>
    public static IServiceCollection AddDependencyInjection(this IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserManager, UserManager>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }

    public static IServiceCollection ConfigureCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(AppConfigurations.Cors.DefaultCorsPolicy, policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .WithExposedHeaders("Content-Disposition");
            });
        });

        return services;
    }
}
