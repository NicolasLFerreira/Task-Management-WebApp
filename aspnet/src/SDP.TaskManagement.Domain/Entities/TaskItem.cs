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

    public TaskItemGroup? Group { get; set; }
    public long GroupId { get; set; }
}

public enum TaskItemPriority
{
    Low,
    Medium,
    High
}

public enum TaskItemStatus
{
    Todo,
    InProgress,
    Completed
}