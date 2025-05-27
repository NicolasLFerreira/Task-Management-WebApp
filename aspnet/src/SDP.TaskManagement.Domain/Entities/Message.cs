using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class Message : Entity
{
    public required string Content { get; set; }

    public bool IsRead { get; set; }

    public DateTime SentDate { get; set; }

    public DateTime? ReadDate { get; set; }

    // Navigation properties

    public long SenderId { get; set; }

    public User? Sender { get; set; }

    public long RecipientId { get; set; }

    public User? Recipient { get; set; }
}
