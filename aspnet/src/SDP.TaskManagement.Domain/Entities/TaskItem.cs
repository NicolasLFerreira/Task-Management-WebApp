using SDP.TaskManagement.Domain.Enums;

namespace SDP.TaskManagement.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }

    public string Title { get; set; }

    public string? Description { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime CreationTime { get; set; }

    public TaskItemPriority Priority { get; set; }

    public TaskItemStatus ProgressStatus { get; set; }

    public User CreatedByUser { get; set; }
    public Guid CreatedByUserId { get; set; }

    public User AssignedToUser { get; set; }
    public Guid AssignedToUserId { get; set; }
}
