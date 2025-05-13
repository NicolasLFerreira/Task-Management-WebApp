using SDP.TaskManagement.Domain.Base;
using System.Collections.Generic;

namespace SDP.TaskManagement.Domain.Entities;

public class Label : Entity
{
    public required string Name { get; set; }
    public required string Color { get; set; }
    public long BoardId { get; set; }

    // Navigation properties
    public required Board Board { get; set; }
    public virtual ICollection<TaskItemLabel>? TaskItems { get; set; }
}
