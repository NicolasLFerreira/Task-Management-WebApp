using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

// Join entity for many-to-many relationship between TaskItem and User (assignees)
public class TaskAssignee : Entity
{
    public long TaskItemId { get; set; }
    public long UserId { get; set; }

    // Navigation properties
    public required TaskItem TaskItem { get; set; }
    public required User User { get; set; }
}
