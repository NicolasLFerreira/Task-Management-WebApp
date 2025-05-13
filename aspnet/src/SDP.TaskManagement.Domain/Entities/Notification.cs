using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities;

public enum NotificationType
{
    Assignment = 0,
    Comment = 1,
    Invitation = 2,
    Mention = 3,
    DueDate = 4,
    System = 5
}

public class Notification : Entity
{
    public NotificationType Type { get; set; }
    public required string Content { get; set; }
    public long UserId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreationDate { get; set; }
    public string? EntityType { get; set; }
    public long? EntityId { get; set; }
    public string? ActionLink { get; set; }
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
}
