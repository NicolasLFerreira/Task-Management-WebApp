using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Infrastructure.Persistence;

/// <summary>
/// Access point for the database.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // create migration: dotnet ef migrations add {MigrationName} --startup-project ..\SDP.TaskManagement.WebHost\
    // run migrations: dotnet ef database update
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(Entity).IsAssignableFrom(entityType.ClrType))
            {
                var idProperty = entityType.FindProperty(nameof(Entity.Id));
                if (idProperty != null)
                {
                    idProperty.ValueGenerated = Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.OnAdd;
                    idProperty.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
                }
            }
        }
    }
}
