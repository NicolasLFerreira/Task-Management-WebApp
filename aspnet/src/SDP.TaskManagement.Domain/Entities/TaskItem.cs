using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class TaskItem : Entity
{
    public string Title { get; set; }

    public string? Description { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime CreationTime { get; set; }

    public TaskItemPriority Priority { get; set; }

    public TaskItemStatus ProgressStatus { get; set; }

    public User? OwnerUser { get; set; }
    public long OwnerUserId { get; set; }
}

public enum TaskItemPriority
{
    Low = 0,
    Medium,
    High
}

public enum TaskItemStatus
{
    Todo,
    InProgress,
    Completed
}