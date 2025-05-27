using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class Comment : Entity
{
    public required string Content { get; set; }

    public DateTime PostedAt { get; set; }

    // Navigation properties

    public long UserId { get; set; }

    public User? User { get; set; }

    public long TaskItemId { get; set; }

    public TaskItem? TaskItem { get; set; }
}
