using System;

namespace SDP.TaskManagement.Application.Dtos;

public class ChecklistItemDto
{
    public long Id { get; set; }
    public required string Content { get; set; }
    public bool IsChecked { get; set; }
    public long ChecklistId { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public long? CompletedByUserId { get; set; }
    public string? CompletedByName { get; set; }
}
