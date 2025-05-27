using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class Board : AuditedEntity
{
    public required string Title { get; set; }

    public string? Description { get; set; }

    // Navigation properties

    public long OwnerId { get; set; }

    public User? Owner { get; set; }

    public List<List>? Lists { get; set; }

    public List<BoardMember>? Members { get; set; }
}
