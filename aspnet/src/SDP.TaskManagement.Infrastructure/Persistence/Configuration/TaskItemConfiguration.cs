using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration
{
    public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            builder.ToTable("TaskItems");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(t => t.Description)
                .HasMaxLength(2000);

            builder.Property(t => t.DueDate)
                .IsRequired(false);

            builder.Property(t => t.ProgressStatus)
                .IsRequired();

            builder.Property(t => t.Priority)
                .IsRequired();

            builder.HasOne(t => t.OwnerUser)
                .WithMany()
                .HasForeignKey(t => t.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.List)
                .WithMany(l => l.TaskItems)
                .HasForeignKey(t => t.ListId)
                .OnDelete(DeleteBehavior.Cascade);

            // Remove the explicit many-to-many configuration here since it's already defined in TaskAssigneeConfiguration

            // Configure many-to-many relationship with Label through TaskItemLabel
            builder.HasMany<Label>()
                .WithMany()
                .UsingEntity<TaskItemLabel>(
                    j => j.HasOne<Label>()
                        .WithMany()
                        .HasForeignKey(til => til.LabelId)
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<TaskItem>()
                        .WithMany()
                        .HasForeignKey(til => til.TaskItemId)
                        .OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey(til => new { til.TaskItemId, til.LabelId });
                        j.ToTable("TaskItemLabels");
                    }
                );
        }
    }
}
