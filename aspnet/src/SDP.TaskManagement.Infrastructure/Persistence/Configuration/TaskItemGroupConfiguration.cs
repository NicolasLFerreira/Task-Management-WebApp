using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class TaskItemGroupConfiguration : IEntityTypeConfiguration<TaskItemGroup>
{
    public void Configure(EntityTypeBuilder<TaskItemGroup> builder)
    {
        // Table name

        builder.ToTable("TaskItemGroups");

        // PK

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedOnAdd();

        // Properties

        builder.Property(t => t.Title).HasMaxLength(50).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(2000).IsRequired();

        builder.Property(t => t.CreationTime).IsRequired();
    }
}
