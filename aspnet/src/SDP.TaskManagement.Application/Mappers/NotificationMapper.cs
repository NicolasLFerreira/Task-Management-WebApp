using System.Linq;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class NotificationMapper
{
    public static NotificationDto ToDto(this Notification notification)
    {
        if (notification == null)
            return new NotificationDto
            {
                Content = "Unknown",
                Type = Dtos.NotificationType.System,
                CreationDate = DateTime.UtcNow
            };

        return new NotificationDto
        {
            Id = notification.Id,
            Type = (Dtos.NotificationType)(int)notification.Type,
            Content = notification.Content ?? string.Empty,
            UserId = notification.UserId,
            IsRead = notification.IsRead,
            CreationDate = notification.CreationDate,
            EntityType = notification.EntityType ?? string.Empty,
            EntityId = notification.EntityId,
            ActionLink = notification.ActionLink ?? string.Empty
            // If these properties exist in your NotificationDto and Notification classes, uncomment and fix:
            // RelatedEntityType = notification.RelatedEntityType ?? string.Empty,
            // RelatedEntityId = notification.RelatedEntityId ?? 0,
        };
    }

    public static Notification ToEntity(this NotificationDto dto)
    {
        if (dto == null)
            return new Notification
            {
                Content = "Unknown",
                EntityType = "Unknown",
                ActionLink = "Unknown",
                User = null!
            };

        return new Notification
        {
            Id = dto.Id,
            Type = (Domain.Entities.NotificationType)(int)dto.Type,
            Content = dto.Content,
            UserId = dto.UserId,
            IsRead = dto.IsRead,
            CreationDate = dto.CreationDate,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            ActionLink = dto.ActionLink,
            User = null!
        };
    }
}
