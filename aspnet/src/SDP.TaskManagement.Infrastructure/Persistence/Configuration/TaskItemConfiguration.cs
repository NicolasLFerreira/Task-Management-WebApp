using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        // Table name

        builder.ToTable("TaskItems");

        // PK

        builder.HasKey(t => t.Id);

        // Properties

        builder.Property(t => t.Title).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.Priority).HasConversion<int>();
        builder.Property(t => t.ProgressStatus).HasConversion<int>();

        builder.Property(t => t.CreationTime).IsRequired();

        // Relationships

        builder.HasOne(t => t.CreatedByUser)
               .WithMany(t => t.CreatedTaskItems)
               .HasForeignKey(t => t.CreatedByUserId)
               .IsRequired();

        builder.HasOne(t => t.AssignedToUser)
               .WithMany(t => t.AssignedTaskItems)
               .HasForeignKey(t => t.AssignedToUserId)
               .IsRequired();
    }
}