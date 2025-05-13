using SDP.TaskManagement.Application.Dtos;

namespace SDP.TaskManagement.Application.Abstractions;

public interface IBoardService
{
    Task<BoardDto> GetBoardAsync(long boardId, long userId);
    Task<IEnumerable<BoardDto>> GetUserBoardsAsync(long userId);
    Task<BoardDto> CreateBoardAsync(BoardDto boardDto, long userId);
    Task<BoardDto> UpdateBoardAsync(BoardDto boardDto, long userId);
    Task<bool> DeleteBoardAsync(long boardId, long userId);
    Task<bool> HasAccessToBoardAsync(long boardId, long userId);
    Task<BoardMemberDto> AddBoardMemberAsync(long boardId, long userId, long memberUserId, SDP.TaskManagement.Domain.Entities.BoardMemberRole role);
    Task<bool> RemoveBoardMemberAsync(long boardId, long userId, long memberUserId);
    Task<IEnumerable<BoardMemberDto>> GetBoardMembersAsync(long boardId, long userId);
}
