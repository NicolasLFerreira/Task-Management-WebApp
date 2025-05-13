using System.Linq;
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
            CreationDate = comment.CreationDate,
            TaskItemId = comment.TaskItemId,
            UserId = comment.UserId,
            UserName = author?.Username ?? "Unknown",
            UserProfilePhotoPath = author?.ProfilePhotoPath
        };
    }

    public static Comment ToEntity(this CommentDto dto)
    {
        if (dto == null)
            return new Comment
            {
                Content = "Unknown",
                User = null!,
                TaskItem = null!
            };

        return new Comment
        {
            Id = dto.Id,
            Content = dto.Content,
            CreationDate = dto.CreationDate,
            TaskItemId = dto.TaskItemId,
            UserId = dto.UserId,
            User = null!,
            TaskItem = null!
        };
    }
}
