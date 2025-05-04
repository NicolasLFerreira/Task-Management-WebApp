using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

internal static class TaskItemMapper
{
    public static TaskItem ToEntity(TaskItemDto dto)
    {
        // Ensure dates are in UTC format
        var dueDate = dto.DueDate.Kind != DateTimeKind.Utc 
            ? DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc) 
            : dto.DueDate;
            
        var creationTime = dto.CreationTime.Kind != DateTimeKind.Utc 
            ? DateTime.SpecifyKind(dto.CreationTime, DateTimeKind.Utc) 
            : dto.CreationTime;
            
        return new TaskItem
        {
            Id = dto.Id,
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dueDate,
            CreationTime = creationTime,
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
