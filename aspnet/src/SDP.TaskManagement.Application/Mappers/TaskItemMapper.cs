using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class TaskItemMapper
{
    public static TaskItemDto ToDto(TaskItem entity)
    {
        var dto = new TaskItemDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            DueDate = entity.DueDate,
            Priority = entity.Priority,
            ProgressStatus = entity.ProgressStatus,
            OwnerUserId = entity.OwnerUserId,
            ListId = entity.ListId,
            Position = entity.Position,
            CreatedAt = entity.CreatedAt,
        };

        return dto;
    }
}
