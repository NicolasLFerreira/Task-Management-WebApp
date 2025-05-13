using System.Linq;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Mappers;

public static class BoardMemberMapper
{
    public static BoardMemberDto ToDto(this BoardMember boardMember, User? user = null, Board? board = null, User? invitedBy = null)
    {
        if (boardMember == null)
            return new BoardMemberDto
            {
                UserName = "Unknown",
                UserEmail = "Unknown",
                UserProfilePhotoPath = "Unknown",
                BoardName = "Unknown",
                InviterName = "Unknown"
            };

        return new BoardMemberDto
        {
            Id = boardMember.Id,
            UserId = boardMember.UserId,
            UserName = user?.Username ?? "Unknown",
            UserEmail = user?.Email ?? "Unknown",
            UserProfilePhotoPath = user?.ProfilePhotoPath ?? "Unknown",
            BoardId = boardMember.BoardId,
            BoardName = board?.Title ?? "Unknown",
            Role = (BoardMemberRole)(int)boardMember.Role,
            JoinedDate = boardMember.JoinedDate ?? DateTime.UtcNow,
            InviterId = boardMember.InviterId,
            InviterName = invitedBy?.Username ?? "Unknown"
        };
    }

    public static BoardMember ToEntity(this BoardMemberDto dto)
    {
        if (dto == null)
            return new BoardMember
            {
                User = null!,
                Board = null!,
                Inviter = null!
            };

        return new BoardMember
        {
            Id = dto.Id,
            UserId = dto.UserId,
            BoardId = dto.BoardId,
            Role = (Domain.Entities.BoardMemberRole)(int)dto.Role,
            JoinedDate = dto.JoinedDate,
            InviterId = dto.InviterId,
            User = null!,
            Board = null!,
            Inviter = null!
        };
    }

    public static BoardMemberDto ToDto(BoardMember entity)
    {
        if (entity == null)
            return new BoardMemberDto
            {
                UserName = "Unknown",
                UserEmail = "Unknown",
                UserProfilePhotoPath = "Unknown",
                BoardName = "Unknown",
                InviterName = "Unknown"
            };
        
        return new BoardMemberDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            BoardId = entity.BoardId,
            Role = (BoardMemberRole)(int)entity.Role,
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
