using System.Linq;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Collections.Generic;

namespace SDP.TaskManagement.Application.Mappers;

public static class ChecklistMapper
{
    public static ChecklistDto ToDto(this Checklist checklist, User? creator = null, IEnumerable<ChecklistItem>? items = null)
    {
        if (checklist == null)
            return new ChecklistDto
            {
                Title = "Unknown",
                CreationDate = DateTime.UtcNow
            };

        var dto = new ChecklistDto
        {
            Id = checklist.Id,
            Title = checklist.Title,
            TaskItemId = checklist.TaskItemId,
            CreationDate = checklist.CreationDate,
            CreatedByUserId = checklist.CreatedByUserId,
            CreatedByName = creator?.Username
        };

        if (items != null)
        {
            dto.Items = items.Select(i => i.ToDto()).ToList();
        }
        else if (checklist.Items != null)
        {
            dto.Items = checklist.Items.Select(i => i.ToDto()).ToList();
        }

        return dto;
    }

    public static Checklist ToEntity(this ChecklistDto dto)
    {
        if (dto == null)
            return new Checklist
            {
                Title = "Unknown",
                TaskItem = null!
            };

        return new Checklist
        {
            Id = dto.Id,
            Title = dto.Title,
            TaskItemId = dto.TaskItemId,
            CreationDate = dto.CreationDate,
            CreatedByUserId = dto.CreatedByUserId,
            TaskItem = null!
        };
    }
}
