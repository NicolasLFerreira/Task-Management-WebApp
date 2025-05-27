namespace SDP.TaskManagement.Domain.Base;

public class AuditedEntity : Entity
{
    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
