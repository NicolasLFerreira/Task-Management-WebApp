using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities;

public class Comment : Entity
{
    public required string Content { get; set; }
    public long UserId { get; set; }
    public long TaskItemId { get; set; }
    public DateTime CreationDate { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public TaskItem TaskItem { get; set; } = null!;
}
