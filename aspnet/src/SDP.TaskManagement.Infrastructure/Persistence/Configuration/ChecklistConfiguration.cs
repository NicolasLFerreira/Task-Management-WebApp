using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class ChecklistConfiguration : IEntityTypeConfiguration<Checklist>
{
    public void Configure(EntityTypeBuilder<Checklist> builder)
    {
        // Table name
        builder.ToTable("Checklists");

        // PK
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();

        // Properties
        builder.Property(c => c.Title).HasMaxLength(100).IsRequired();

        // Relationships
        builder.HasOne(c => c.TaskItem)
               .WithMany(t => t.Checklists)
               .HasForeignKey(c => c.TaskItemId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
