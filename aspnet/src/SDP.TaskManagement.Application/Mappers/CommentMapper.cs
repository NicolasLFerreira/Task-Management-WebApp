using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class CommentMapper
{
    public static CommentDto ToDto(this Comment comment, User? author = null)
    {
        if (comment == null)
            return new CommentDto
            {
                Content = "Unknown",
                UserName = "Unknown",
                CreationDate = DateTime.UtcNow
            };

        return new CommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            CreationDate = comment.PostedAt,
            TaskItemId = comment.TaskItemId,
            UserId = comment.UserId,
            UserName = author?.Username ?? "Unknown",
            UserProfilePhotoPath = author?.ProfilePhotoPath
        };
    }
}
