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
            Title = dto.Title ?? "Untitled Task",
            Description = dto.Description,
            DueDate = dto.DueDate,
            CreationTime = dto.CreationTime,
            Priority = (TaskItemPriority)(int)dto.Priority,
            ProgressStatus = (TaskItemStatus)(int)dto.ProgressStatus,
            OwnerUserId = dto.OwnerUserId,
            ListId = dto.ListId,
            Position = dto.Position,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt,
            LastModifiedTime = dto.LastModifiedTime,
            OwnerUser = null!,
            List = null!
        };
    }

    public static TaskItemDto ToDto(TaskItem entity)
    {
        var dto = new TaskItemDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            DueDate = entity.DueDate,
            CreationTime = entity.CreationTime,
            Priority = (TaskItemPriority)(int)entity.Priority,
            ProgressStatus = (TaskItemStatus)(int)entity.ProgressStatus,
            OwnerUserId = entity.OwnerUserId,
            ListId = entity.ListId,
            Position = entity.Position,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            LastModifiedTime = entity.LastModifiedTime
        };

        // Add related entities if they are loaded
        if (entity.Labels != null)
        {
            dto.Labels = entity.Labels.Select(l => LabelMapper.ToDto(l.Label)).ToList();
        }

        if (entity.Comments != null)
        {
            dto.Comments = entity.Comments.Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                UserId = c.UserId,
                UserName = c.User?.Username ?? "Unknown",
                TaskItemId = c.TaskItemId,
                CreationDate = c.CreationDate,
                UserProfilePhotoPath = c.User?.ProfilePhotoPath
            }).ToList();
        }

        if (entity.Attachments != null)
        {
            dto.Attachments = entity.Attachments.Select(a => new AttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FilePath = a.FilePath,
                TaskItemId = a.TaskItemId,
                UploadTime = a.UploadTime,
                FileType = a.FileType,
                FileSize = a.FileSize,
                UploadedById = a.UploadedById,
                UploadedByUsername = a.UploadedBy?.Username ?? "Unknown",
                FormattedFileSize = FormatFileSize(a.FileSize)
            }).ToList();
        }

        if (entity.Checklists != null)
        {
            dto.Checklists = entity.Checklists.Select(c => new ChecklistDto
            {
                Id = c.Id,
                Title = c.Title,
                TaskItemId = c.TaskItemId,
                CreationDate = c.CreationDate,
                CreatedByUserId = c.CreatedByUserId,
                CreatedByName = c.CreatedBy?.Username,
                Items = c.Items?.Select(i => new ChecklistItemDto
                {
                    Id = i.Id,
                    Content = i.Content,
                    IsChecked = i.IsChecked,
                    ChecklistId = i.ChecklistId,
                    CreationDate = i.CreationDate,
                    CompletionDate = i.CompletionDate,
                    CompletedByUserId = i.CompletedByUserId,
                    CompletedByName = i.CompletedBy?.Username
                }).ToList() ?? new List<ChecklistItemDto>()
            }).ToList();
        }

        if (entity.Assignees != null)
        {
            dto.Assignees = entity.Assignees
                .Select(a => a.User)
                .Where(u => u != null)
                .Select(UserMapper.ToDto)
                .ToList();
        }

        return dto;
    }

    public static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;

        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }

        return $"{len:0.##} {sizes[order]}";
    }

    public static void UpdateEntity(TaskItem entity, TaskItemDto dto)
    {
        entity.Title = dto.Title ?? "Untitled Task";
        entity.Description = dto.Description;
        entity.DueDate = dto.DueDate;
        entity.Priority = (Domain.Entities.TaskItemPriority)(int)dto.Priority;
        entity.ProgressStatus = (Domain.Entities.TaskItemStatus)(int)dto.ProgressStatus;
        entity.OwnerUserId = dto.OwnerUserId;
        entity.ListId = dto.ListId;
        entity.Position = dto.Position;
        entity.UpdatedAt = dto.UpdatedAt;
        entity.LastModifiedTime = dto.LastModifiedTime;
    }
}
