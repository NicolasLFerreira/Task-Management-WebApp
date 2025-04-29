using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Services.Auth;
using SDP.TaskManagement.Infrastructure.Managers;
using SDP.TaskManagement.Infrastructure.Repository;

namespace SDP.TaskManagement.WebHost;

/// <summary>
/// Handles dependency injection.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection RegisterInfrastructureDependencyInjection(this IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserManager, UserManager>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
