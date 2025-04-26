using Microsoft.EntityFrameworkCore.Metadata.Builders;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class TaskItemConfiguration
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Description).HasMaxLength(2000);
        builder.Property(t => t.Priority).HasConversion<int>();

        builder.Property(t => t.CreationTime).IsRequired();
        builder.Property(t => t.CreatedByUser).IsRequired();
    }
}