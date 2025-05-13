using System;

namespace SDP.TaskManagement.Application.Dtos;

public enum BoardMemberRole
{
    Member = 0,
    Admin = 1
}

public class BoardMemberDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserProfilePhotoPath { get; set; } = string.Empty;
    public long BoardId { get; set; }
    public string BoardName { get; set; } = string.Empty;
    public BoardMemberRole Role { get; set; }
    public DateTime JoinedDate { get; set; }
    public long? InviterId { get; set; }
    public string InviterName { get; set; } = string.Empty;
}
