using System.Linq;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class MessageMapper
{
    public static MessageDto ToDto(this Message message, User? sender = null, User? receiver = null)
    {
        if (message == null)
            return new MessageDto
            {
                SenderName = "Unknown",
                SenderProfilePhotoPath = "Unknown",
                RecipientName = "Unknown",
                RecipientProfilePhotoPath = "Unknown",
                Content = "Unknown",
                CreationDate = DateTime.UtcNow
            };

        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            SenderName = sender?.Username ?? "Unknown",
            SenderProfilePhotoPath = sender?.ProfilePhotoPath ?? "Unknown",
            RecipientId = message.RecipientId,
            RecipientName = receiver?.Username ?? "Unknown",
            RecipientProfilePhotoPath = receiver?.ProfilePhotoPath ?? "Unknown",
            Content = message.Content,
            CreationDate = message.CreationDate,
            IsRead = message.IsRead,
            ReadDate = message.ReadDate
        };
    }

    public static Message ToEntity(this MessageDto dto)
    {
        if (dto == null)
            return new Message
            {
                Content = "Unknown",
                Sender = null!,
                Recipient = null!
            };

        return new Message
        {
            Id = dto.Id,
            SenderId = dto.SenderId,
            RecipientId = dto.RecipientId,
            Content = dto.Content,
            CreationDate = dto.CreationDate,
            IsRead = dto.IsRead,
            ReadDate = dto.ReadDate,
            Sender = null!,
            Recipient = null!
        };
    }

    public static MessageDto ToDto(Message entity)
    {
        if (entity == null)
            return new MessageDto
            {
                SenderName = "Unknown",
                SenderProfilePhotoPath = "Unknown",
                RecipientName = "Unknown",
                RecipientProfilePhotoPath = "Unknown",
                Content = "Unknown",
                CreationDate = DateTime.UtcNow
            };
        
        return new MessageDto
        {
            Id = entity.Id,
            Content = entity.Content,
            CreationDate = entity.CreationDate,
            IsRead = entity.IsRead,
            SenderId = entity.SenderId,
            RecipientId = entity.RecipientId,
            SenderName = entity.Sender?.Username ?? "Unknown",
            SenderProfilePhotoPath = entity.Sender?.ProfilePhotoPath ?? "Unknown",
            RecipientName = entity.Recipient?.Username ?? "Unknown",
            RecipientProfilePhotoPath = entity.Recipient?.ProfilePhotoPath ?? "Unknown"
        };
    }
}
