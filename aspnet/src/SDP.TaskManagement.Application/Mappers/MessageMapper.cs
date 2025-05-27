using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class MessageMapper
{
    public static MessageDto ToDto(Message entity)
    {
        return new MessageDto
        {
            Id = entity.Id,
            Content = entity.Content,
            CreationDate = entity.SentDate,
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
