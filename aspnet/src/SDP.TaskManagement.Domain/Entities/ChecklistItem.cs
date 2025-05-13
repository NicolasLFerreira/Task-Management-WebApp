using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities;

public class ChecklistItem : Entity
{
    public required string Content { get; set; }
    public bool IsChecked { get; set; }
    public long ChecklistId { get; set; }
    public DateTime CreationDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public long? CompletedByUserId { get; set; }
    
    // Navigation properties
    public Checklist Checklist { get; set; } = null!;
    public User? CompletedBy { get; set; }
}
