using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class BoardMemberMapper
{
    public static BoardMemberDto ToDto(BoardMember entity)
    {
        return new BoardMemberDto
        {
            Id = entity.Id,
            MemberId = entity.UserId,
            BoardId = entity.BoardId,
            Role = entity.Role,
            UserName = entity.User?.Username ?? "Unknown",
            UserEmail = entity.User?.Email ?? "Unknown",
            UserProfilePhotoPath = entity.User?.ProfilePhotoPath ?? "Unknown",
            BoardName = entity.Board?.Title ?? "Unknown",
            JoinedDate = entity.JoinedDate ?? DateTime.UtcNow,
            InviterId = entity.InviterId,
            InviterName = entity.Inviter?.Username ?? "Unknown"
        };
    }
}
