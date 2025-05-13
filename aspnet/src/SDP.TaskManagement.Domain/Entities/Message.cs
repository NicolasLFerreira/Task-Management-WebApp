using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities;

public class Message : Entity
{
    public long SenderId { get; set; }
    public long RecipientId { get; set; }
    public required string Content { get; set; }
    public DateTime CreationDate { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadDate { get; set; }
    
    // Navigation properties
    public User Sender { get; set; } = null!;
    public User Recipient { get; set; } = null!;
}
