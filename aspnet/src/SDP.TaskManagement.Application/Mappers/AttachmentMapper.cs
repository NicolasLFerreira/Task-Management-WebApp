using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class AttachmentMapper
{
    public static AttachmentDto ToDto(this Attachment attachment)
    {
        return new AttachmentDto
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            FilePath = attachment.FilePath,
            FileSize = attachment.FileSize,
            FileType = attachment.FileType,
            UploadTime = attachment.UploadedAt,
            UploadUsername = attachment.UploadUser?.Username ?? "",
        };
    }
}
