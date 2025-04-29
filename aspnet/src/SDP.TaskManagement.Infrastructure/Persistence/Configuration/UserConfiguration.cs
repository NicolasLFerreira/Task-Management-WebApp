using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Table name

        builder.ToTable("Users");

        // PK

        builder.HasKey(t => t.Id);

        // Properties

        builder.Property(t => t.Name).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Email).IsRequired().HasMaxLength(200);
        builder.Property(t => t.PasswordHash).IsRequired();
        builder.Property(t => t.Role).IsRequired();

        // Indexes

        builder.HasIndex(t => t.Email).IsUnique();
    }
}