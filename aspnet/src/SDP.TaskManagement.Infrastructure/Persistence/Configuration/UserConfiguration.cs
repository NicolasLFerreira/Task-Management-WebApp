using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Email).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Password).IsRequired();
        builder.Property(t => t.Role).IsRequired();
    }
}