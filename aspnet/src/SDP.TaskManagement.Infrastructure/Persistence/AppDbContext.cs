using Microsoft.EntityFrameworkCore;

namespace SDP.TaskManagement.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // create migration: dotnet ef migrations add {MigrationName} --startup-project ..\SDP.TaskManagement.WebHost\
    // run migrations: dotnet ef database update
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
