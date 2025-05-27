using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class Label : Entity
{
    public required string Name { get; set; }

    public required string Color { get; set; }

    // FKs

    public long BoardId { get; set; }

    public required Board Board { get; set; }

    public List<TaskItemLabel>? TaskItems { get; set; }
}
