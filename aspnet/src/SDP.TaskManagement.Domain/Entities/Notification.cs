using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities;

public enum NotificationType
{
    System,
    Assignment,
    Comment,
    Invitation,
    Mention,
    DueDate
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
