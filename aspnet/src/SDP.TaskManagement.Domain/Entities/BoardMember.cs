using SDP.TaskManagement.Domain.Base;

namespace SDP.TaskManagement.Domain.Entities;

public class BoardMember : Entity
{
    public BoardMemberRole Role { get; set; }

    public DateTime? JoinedDate { get; set; }

    // Navigation properties

    public long UserId { get; set; }

    public required User User { get; set; }

    public long BoardId { get; set; }

    public required Board Board { get; set; }

    public long? InviterId { get; set; }

    public User? Inviter { get; set; }
}

public enum BoardMemberRole
{
    Member = 0,
    Admin = 1
}
