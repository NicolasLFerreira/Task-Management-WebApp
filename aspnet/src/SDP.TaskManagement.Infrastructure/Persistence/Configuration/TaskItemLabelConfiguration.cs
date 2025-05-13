using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class TaskItemLabelConfiguration : IEntityTypeConfiguration<TaskItemLabel>
{
    public void Configure(EntityTypeBuilder<TaskItemLabel> builder)
    {
        builder.HasKey(til => new { til.TaskItemId, til.LabelId });

        builder.HasOne(til => til.TaskItem)
            .WithMany(t => t.Labels)
            .HasForeignKey(til => til.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(til => til.Label)
            .WithMany(l => l.TaskItems)
            .HasForeignKey(til => til.LabelId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
