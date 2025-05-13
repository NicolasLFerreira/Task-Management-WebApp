using SDP.TaskManagement.Domain.Base;
using System.Collections.Generic;

namespace SDP.TaskManagement.Domain.Entities;

public class List : Entity
{
    public required string Title { get; set; }
    public long BoardId { get; set; }
    public int Position { get; set; }

    // Navigation properties
    public required Board Board { get; set; }
    public virtual ICollection<TaskItem>? TaskItems { get; set; }
}
