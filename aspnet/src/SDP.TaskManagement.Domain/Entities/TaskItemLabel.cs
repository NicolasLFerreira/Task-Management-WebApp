using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

// Join entity for many-to-many relationship between TaskItem and Label
public class TaskItemLabel : Entity
{
    public long TaskItemId { get; set; }

    public TaskItem? TaskItem { get; set; }

    public long LabelId { get; set; }

    public Label? Label { get; set; }
}
