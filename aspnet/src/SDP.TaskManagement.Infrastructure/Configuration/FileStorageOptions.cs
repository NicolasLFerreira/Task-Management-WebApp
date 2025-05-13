namespace SDP.TaskManagement.Infrastructure.Configuration;

public class FileStorageOptions
{
    public const string SectionName = "FileStorage";
    
    public string BasePath { get; set; } = "attachments";
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024; // 10MB default
    public string[] AllowedFileTypes { get; set; } = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt" };
    public string ProfilePhotoDirectory { get; set; } = "profile-photo";
    public string AttachmentsDirectory { get; set; } = "attachments";
}
