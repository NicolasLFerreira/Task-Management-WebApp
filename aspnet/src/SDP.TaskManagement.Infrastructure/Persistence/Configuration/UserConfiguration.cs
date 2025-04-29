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

        builder.Property(t => t.Name).HasMaxLength(50).IsRequired();
        builder.Property(t => t.Email).HasMaxLength(100).IsRequired();
        builder.Property(t => t.PasswordHash).IsRequired();

        // Indexes

        builder.HasIndex(t => t.Email).IsUnique();
    }
}