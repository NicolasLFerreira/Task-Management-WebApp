using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities;

public class Attachment : Entity
{
    public required string FileName { get; set; }
    public required string FilePath { get; set; }
    public long FileSize { get; set; }
    public required string FileType { get; set; }
    public DateTime UploadTime { get; set; }
    public long TaskItemId { get; set; }
    public long UploadedById { get; set; }
    
    // Navigation properties
    public TaskItem TaskItem { get; set; } = null!;
    public User UploadedBy { get; set; } = null!;
}
