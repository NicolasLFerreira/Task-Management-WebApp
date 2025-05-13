using System;
using System.Collections.Generic;

namespace SDP.TaskManagement.Application.Dtos;

public enum TaskItemPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

public enum TaskItemStatus
{
    ToDo = 0,
    InProgress = 1,
    InReview = 2,
    Done = 3,
    Archived = 4
}

public class TaskItemDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreationTime { get; set; }
    public DateTime? LastModifiedTime { get; set; }
    public TaskItemPriority Priority { get; set; }
    public TaskItemStatus ProgressStatus { get; set; }
    public long OwnerUserId { get; set; }
    public string? OwnerUserName { get; set; }
    public long ListId { get; set; }
    public string? ListName { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<UserDto>? Assignees { get; set; }
    public List<LabelDto>? Labels { get; set; }
    public List<CommentDto>? Comments { get; set; }
    public List<AttachmentDto>? Attachments { get; set; }
    public List<ChecklistDto>? Checklists { get; set; }
}
