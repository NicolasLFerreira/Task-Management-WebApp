using SDP.TaskManagement.Domain.Base;
using System;
using System.Collections.Generic;

namespace SDP.TaskManagement.Domain.Entities;

public class Checklist : Entity
{
    public required string Title { get; set; }
    public long TaskItemId { get; set; }
    public DateTime CreationDate { get; set; }
    public long? CreatedByUserId { get; set; }
    
    // Navigation properties
    public TaskItem TaskItem { get; set; } = null!;
    public User? CreatedBy { get; set; }
    public ICollection<ChecklistItem> Items { get; set; } = new List<ChecklistItem>();
}
