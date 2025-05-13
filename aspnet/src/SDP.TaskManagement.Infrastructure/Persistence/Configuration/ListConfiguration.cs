using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration;

public class ListConfiguration : IEntityTypeConfiguration<List>
{
    public void Configure(EntityTypeBuilder<List> builder)
    {
        // Table name
        builder.ToTable("Lists");

        // PK
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).ValueGeneratedOnAdd();

        // Properties
        builder.Property(l => l.Title).HasMaxLength(100).IsRequired();
        builder.Property(l => l.Position).IsRequired();

        // Relationships
        builder.HasOne(l => l.Board)
               .WithMany(b => b.Lists)
               .HasForeignKey(l => l.BoardId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
