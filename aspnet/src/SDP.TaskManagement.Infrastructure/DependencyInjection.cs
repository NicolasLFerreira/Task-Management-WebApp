using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.Infrastructure.Repository;

namespace SDP.TaskManagement.Infrastructure;

/// <summary>
/// Adds services and handles dependency injection of business classes.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Db configuration
        services.AddDbContext<AppDbContext>(options => options.UseSqlServer("DefaultConnection"));

        // Dependency Injection
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));

        return services;
    }
}
