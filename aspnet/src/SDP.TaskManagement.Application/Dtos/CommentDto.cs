using System;

namespace SDP.TaskManagement.Application.Dtos;

public class CommentDto
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public long UserId { get; set; }
    public required string UserName { get; set; }
    public long TaskItemId { get; set; }
    public DateTime CreationDate { get; set; }
    public string? UserProfilePhotoPath { get; set; }
}
