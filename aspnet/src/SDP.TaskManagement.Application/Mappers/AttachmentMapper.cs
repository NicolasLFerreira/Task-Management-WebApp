using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System;

namespace SDP.TaskManagement.Application.Mappers;

public static class AttachmentMapper
{
    public static AttachmentDto ToDto(this Attachment attachment, string? uploaderUsername = null)
    {
        if (attachment == null)
            return new AttachmentDto
            {
                FileName = "Unknown",
                FilePath = "Unknown",
                FileType = "Unknown",
                UploadedByUsername = uploaderUsername ?? "Unknown",
                FormattedFileSize = "0 B"
            };
            
        return new AttachmentDto
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            FilePath = attachment.FilePath,
            FileSize = attachment.FileSize,
            FileType = attachment.FileType,
            UploadTime = attachment.UploadTime,
            TaskItemId = attachment.TaskItemId,
            UploadedById = attachment.UploadedById,
            UploadedByUsername = uploaderUsername ?? attachment.UploadedBy?.Username ?? "Unknown",
            FormattedFileSize = FormatFileSize(attachment.FileSize)
        };
    }
    
    public static Attachment ToEntity(this AttachmentDto dto)
    {
        if (dto == null)
            return new Attachment
            {
                FileName = "Unknown",
                FilePath = "Unknown",
                FileType = "Unknown",
                TaskItem = null!,
                UploadedBy = null!
            };
            
        return new Attachment
        {
            Id = dto.Id,
            FileName = dto.FileName,
            FilePath = dto.FilePath,
            FileSize = dto.FileSize,
            FileType = dto.FileType,
            UploadTime = dto.UploadTime,
            TaskItemId = dto.TaskItemId,
            UploadedById = dto.UploadedById,
            TaskItem = null!,
            UploadedBy = null!
        };
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
}
