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
        builder.Property(t => t.Id).ValueGeneratedOnAdd();

        // Properties

        builder.Property(t => t.Title).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.CreationTime).IsRequired();

        builder.Property(t => t.Priority).HasConversion<int>().IsRequired();
        builder.Property(t => t.ProgressStatus).HasConversion<int>().IsRequired();

        // Relationships

        builder.HasOne(t => t.OwnerUser)
               .WithMany(t => t.OwnedTaskItems)
               .HasForeignKey(t => t.OwnerUserId)
               .IsRequired();
    }
}