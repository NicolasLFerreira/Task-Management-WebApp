using SDP.TaskManagement.Domain.Base;
using System;

namespace SDP.TaskManagement.Domain.Entities
{
    public enum BoardMemberRole
    {
        Viewer = 0,
        Member = 1,
        Admin = 2
    }

    public class BoardMember : Entity
    {
        public long UserId { get; set; }
        public long BoardId { get; set; }
        public BoardMemberRole Role { get; set; }
        public DateTime? JoinedDate { get; set; }
        public long? InviterId { get; set; }

        // Navigation properties
        public required User User { get; set; }
        public required Board Board { get; set; }
        public User? Inviter { get; set; }
    }
}
