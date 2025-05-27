using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class Attachment : Entity
{
    public required string FileName { get; set; }

    public required string FilePath { get; set; }

    public required string FileType { get; set; }

    public long FileSize { get; set; }

    public DateTime UploadTime { get; set; }

    // Navigation properties

    public long TaskItemId { get; set; }

    public TaskItem? TaskItem { get; set; }

    public long UploadUserId { get; set; }

    public User? UploadUser { get; set; }
}
