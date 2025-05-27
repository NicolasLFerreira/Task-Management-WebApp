using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Dtos;

public class TaskItemDto
{
    public long Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskItemPriority Priority { get; set; }

    public TaskItemStatus ProgressStatus { get; set; }

    public int Position { get; set; }

    public DateTime CreatedAt { get; set; }
}
