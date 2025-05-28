using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class List : Entity
{
    public required string Title { get; set; }

    public int Position { get; set; }

    // Navigation properties

    public long BoardId { get; set; }

    public Board? Board { get; set; }

    public List<TaskItem>? TaskItems { get; set; }
}
