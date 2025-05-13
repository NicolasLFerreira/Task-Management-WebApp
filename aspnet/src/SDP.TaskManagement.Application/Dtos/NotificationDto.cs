using System;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Dtos;

public class NotificationDto
{
    public long Id { get; set; }
    public NotificationType Type { get; set; }
    public string Content { get; set; } = string.Empty;
    public long UserId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreationDate { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public long? EntityId { get; set; }
    public string ActionLink { get; set; } = string.Empty;
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
}
