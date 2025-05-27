using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class TaskItem : AuditedEntity
{
    public required string Title { get; set; }

    public string? Description { get; set; }

    public TaskItemPriority Priority { get; set; }

    public TaskItemStatus ProgressStatus { get; set; }

    public DateTime? DueDate { get; set; }

    // List related

    public long ListId { get; set; }

    public List? List { get; set; }

    public int Position { get; set; }

    // Relationships

    public long OwnerUserId { get; set; }

    public User? OwnerUser { get; set; }

    // Collections

    public List<TaskAssignee> Assignees { get; set; } = [];

    public List<TaskItemLabel>? Labels { get; set; }

    public List<Comment>? Comments { get; set; }

    public List<Attachment>? Attachments { get; set; }
}

public enum TaskItemPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

public enum TaskItemStatus
{
    Todo = 0,
    InProgress = 1,
    InReview = 2,
    Completed = 3,
    Archived = 4
}