using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class NotificationMapper
{
    public static NotificationDto ToDto(this Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Type = (NotificationType)(int)notification.Type,
            Content = notification.Content ?? string.Empty,
            UserId = notification.UserId,
            IsRead = notification.IsRead,
            CreationDate = notification.CreatedAt,
            EntityType = notification.EntityType ?? string.Empty,
            EntityId = notification.EntityId,
            ActionLink = notification.ActionLink ?? string.Empty
            // If these properties exist in your NotificationDto and Notification classes, uncomment and fix:
            // RelatedEntityType = notification.RelatedEntityType ?? string.Empty,
            // RelatedEntityId = notification.RelatedEntityId ?? 0,
        };
    }
}
