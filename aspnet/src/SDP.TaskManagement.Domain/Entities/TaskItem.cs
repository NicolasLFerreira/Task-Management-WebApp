using SDP.TaskManagement.Domain.Base;
using System;
using System.Collections.Generic;

namespace SDP.TaskManagement.Domain.Entities;


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

public class TaskItem : Entity
{
    public required string Title { get; set; }

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreationTime { get; set; }

    public TaskItemPriority Priority { get; set; }

    public TaskItemStatus ProgressStatus { get; set; }

    // New properties for the board/list structure
    public long ListId { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastModifiedTime { get; set; }

    // Relationships
    public List? List { get; set; }
    public User? OwnerUser { get; set; }
    public long OwnerUserId { get; set; }
    
    // Collections
    public ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
    public ICollection<TaskItemLabel> Labels { get; set; } = new List<TaskItemLabel>();
    public ICollection<Comment>? Comments { get; set; } = new List<Comment>();
    public ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public ICollection<Checklist>? Checklists { get; set; } = new List<Checklist>();
}
