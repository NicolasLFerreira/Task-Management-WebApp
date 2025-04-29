using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly IConfiguration _configuration;

    public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
    }

    // Tables
    public DbSet<User> Tasks { get; set; }
    public DbSet<TaskItem> TaskItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //{
    //    // Gets the connection string
    //    optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));

    //    // Applies migrations
    //    Database.Migrate();
    //}
}
