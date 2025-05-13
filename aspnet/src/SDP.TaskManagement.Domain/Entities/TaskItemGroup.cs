using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class TaskItemGroup : Entity
{
    public string Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreationTime { get; set; }

    public List<TaskItem>? TaskItems { get; set; }
}
