using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class TaskItemMapper
{
    public static TaskItem ToEntity(TaskItemDto dto)
    {
        return new TaskItem
        {
            Id = dto.Id,
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            CreationTime = dto.CreationTime,
            Priority = dto.Priority,
            ProgressStatus = dto.ProgressStatus,
            OwnerUserId = dto.OwnerUserId
        };
    }

    public static TaskItemDto ToDto(TaskItem entity)
    {
        return new TaskItemDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            DueDate = entity.DueDate,
            CreationTime = entity.CreationTime,
            Priority = entity.Priority,
            ProgressStatus = entity.ProgressStatus,
            OwnerUserId = entity.OwnerUserId,
        };
    }
}
