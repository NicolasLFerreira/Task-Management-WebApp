using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Infrastructure.Persistence.Configuration
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).ValueGeneratedOnAdd();

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(u => u.PasswordHash)
                .IsRequired();
                
            builder.Property(u => u.FirstName)
                .HasMaxLength(50);
                
            builder.Property(u => u.LastName)
                .HasMaxLength(50);
                
            builder.Property(u => u.ProfilePhotoPath)
                .HasMaxLength(255);
                
            builder.Property(u => u.LastLogin);
            
            // Indexes
            builder.HasIndex(u => u.Username).IsUnique();
            builder.HasIndex(u => u.Email).IsUnique();
            
            // Relationships
            builder.HasMany(u => u.OwnedBoards)
                .WithOne(b => b.Owner)
                .HasForeignKey(b => b.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(u => u.OwnedTasks)
                .WithOne(t => t.OwnerUser)
                .HasForeignKey(t => t.OwnerUserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(u => u.Comments)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(u => u.Notifications)
                .WithOne(n => n.User)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
