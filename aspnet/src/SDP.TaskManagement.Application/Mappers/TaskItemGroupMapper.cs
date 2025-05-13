using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class TaskItemGroupMapper
{
    public static TaskItemGroup ToEntity(TaskItemGroupDto dto)
    {
        return new TaskItemGroup
        {
            Title = dto.Title,
            Description = dto.Description,
            CreationTime = dto.CreationTime
        };
    }

    public static TaskItemGroupDto ToDto(TaskItemGroup entity)
    {
        return new TaskItemGroupDto
        {
            Title = entity.Title,
            Description = entity.Description,
            CreationTime = entity.CreationTime
        };
    }
}

