using System;

namespace SDP.TaskManagement.Application.Dtos;

public class MessageDto
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public required string SenderName { get; set; }
    public string? SenderProfilePhotoPath { get; set; }
    public long RecipientId { get; set; }
    public required string RecipientName { get; set; }
    public string? RecipientProfilePhotoPath { get; set; }
    public required string Content { get; set; }
    public DateTime CreationDate { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadDate { get; set; }
}
