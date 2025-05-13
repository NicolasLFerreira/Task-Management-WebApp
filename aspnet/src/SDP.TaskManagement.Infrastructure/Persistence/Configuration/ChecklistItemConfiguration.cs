using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class ChecklistItemConfiguration : IEntityTypeConfiguration<ChecklistItem>
{
    public void Configure(EntityTypeBuilder<ChecklistItem> builder)
    {
        // Table name
        builder.ToTable("ChecklistItems");

        // PK
        builder.HasKey(ci => ci.Id);
        builder.Property(ci => ci.Id).ValueGeneratedOnAdd();

        // Properties
        builder.Property(ci => ci.Content).HasMaxLength(500).IsRequired();
        builder.Property(ci => ci.IsChecked).IsRequired();

        // Relationships
        builder.HasOne(ci => ci.Checklist)
               .WithMany(c => c.Items)
               .HasForeignKey(ci => ci.ChecklistId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
