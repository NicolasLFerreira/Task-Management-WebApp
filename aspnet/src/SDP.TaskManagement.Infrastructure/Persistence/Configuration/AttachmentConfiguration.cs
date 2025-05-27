using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration
{
    public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
    {
        public void Configure(EntityTypeBuilder<Attachment> builder)
        {
            builder.ToTable("Attachments");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.FileName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(a => a.FilePath)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(a => a.FileSize)
                .IsRequired();

            builder.Property(a => a.FileType)
                .HasMaxLength(100);

            builder.Property(a => a.UploadTime)
                .IsRequired();

            builder.HasOne(a => a.TaskItem)
                .WithMany(t => t.Attachments)
                .HasForeignKey(a => a.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.UploadUser)
                .WithMany()
                .HasForeignKey(a => a.UploadUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
