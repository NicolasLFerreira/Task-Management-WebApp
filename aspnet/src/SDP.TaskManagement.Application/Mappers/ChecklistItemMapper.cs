using System.Linq;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class ChecklistItemMapper
{
    public static ChecklistItemDto ToDto(this ChecklistItem item, User? completedBy = null)
    {
        if (item == null)
            return new ChecklistItemDto
            {
                Content = "Unknown",
                CreationDate = DateTime.UtcNow
            };

        return new ChecklistItemDto
        {
            Id = item.Id,
            Content = item.Content,
            IsChecked = item.IsChecked,
            ChecklistId = item.ChecklistId,
            CreationDate = item.CreationDate,
            CompletionDate = item.CompletionDate,
            CompletedByUserId = item.CompletedByUserId,
            CompletedByName = completedBy?.Username
        };
    }

    public static ChecklistItem ToEntity(this ChecklistItemDto dto)
    {
        if (dto == null)
            return new ChecklistItem
            {
                Content = "Unknown",
                Checklist = null!
            };

        return new ChecklistItem
        {
            Id = dto.Id,
            Content = dto.Content,
            IsChecked = dto.IsChecked,
            ChecklistId = dto.ChecklistId,
            CreationDate = dto.CreationDate,
            CompletionDate = dto.CompletionDate,
            CompletedByUserId = dto.CompletedByUserId,
            Checklist = null!
        };
    }
}
