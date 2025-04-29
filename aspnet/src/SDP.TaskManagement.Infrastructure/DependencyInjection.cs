using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.Infrastructure.Repository;

namespace SDP.TaskManagement.Infrastructure;

/// <summary>
/// Handles dependency injection of business classes.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection RegisterInfrastructureDependencyInjection(this IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));

        return services;
    }
}
