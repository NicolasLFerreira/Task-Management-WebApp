using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

// Join entity for many-to-many relationship between TaskItem and User (assignees)
public class TaskAssignee : Entity
{
    public long UserId { get; set; }

    public required User User { get; set; }

    public long TaskItemId { get; set; }

    public required TaskItem TaskItem { get; set; }
}
