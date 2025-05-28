namespace SDP.TaskManagement.Application.Dtos;

public class AttachmentDto
{
    public long Id { get; set; }

    public required string FileName { get; set; }

    public required string FilePath { get; set; }

    public long FileSize { get; set; }

    public required string FileType { get; set; }

    public DateTime UploadTime { get; set; }
    
    // Additional properties for UI display
    public required string UploadUsername { get; set; }
}
