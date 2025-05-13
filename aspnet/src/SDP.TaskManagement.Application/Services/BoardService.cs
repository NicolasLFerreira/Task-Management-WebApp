using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SDP.TaskManagement.Application.Services;

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

public class BoardService : IBoardService
{
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;
    private readonly IRepository<User> _userRepository;

    public BoardService(
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository,
        IRepository<User> userRepository)
    {
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
        _userRepository = userRepository;
    }

    public async Task<BoardDto> GetBoardAsync(long boardId, long userId)
    {
        if (!await HasAccessToBoardAsync(boardId, userId))
            throw new UnauthorizedAccessException("You don't have access to this board");

        var board = await _boardRepository.GetByIdAsync(boardId);
        if (board == null)
            throw new KeyNotFoundException($"Board with ID {boardId} not found");
            
        var owner = await _userRepository.GetByIdAsync(board.OwnerId);
        
        return BoardMapper.ToDto(board);
    }

    public async Task<IEnumerable<BoardDto>> GetUserBoardsAsync(long userId)
    {
        // Get boards owned by the user
        var ownedBoards = await _boardRepository.GetQueryable()
            .Where(b => b.OwnerId == userId)
            .ToListAsync();
            
        // Get boards where the user is a member
        var memberBoardIds = await _boardMemberRepository.GetQueryable()
            .Where(bm => bm.UserId == userId)
            .Select(bm => bm.BoardId)
            .ToListAsync();
            
        var memberBoards = await _boardRepository.GetQueryable()
            .Where(b => memberBoardIds.Contains(b.Id))
            .ToListAsync();
            
        // Combine and convert to DTOs
        var allBoards = ownedBoards.Concat(memberBoards.Where(b => !ownedBoards.Any(ob => ob.Id == b.Id))).ToList();
        var ownerIds = allBoards.Select(b => b.OwnerId).Distinct().ToList();
        var owners = await _userRepository.GetQueryable()
            .Where(u => ownerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u);
            
        return allBoards.Select(b => BoardMapper.ToDto(b));
    }

    public async Task<BoardDto> CreateBoardAsync(BoardDto boardDto, long userId)
    {
        var board = new Board
        {
            OwnerId = userId,
            Title = boardDto.Title,
            Description = boardDto.Description,
            CreationDate = DateTime.UtcNow,
            LastModifiedDate = DateTime.UtcNow,
            Owner = null!
        };
        
        await _boardRepository.AddAsync(board);
        var owner = await _userRepository.GetByIdAsync(userId);
        
        return BoardMapper.ToDto(board);
    }

    public async Task<BoardDto> UpdateBoardAsync(BoardDto boardDto, long userId)
    {
        var board = await _boardRepository.GetByIdAsync(boardDto.Id);
        
        if (board == null)
            throw new KeyNotFoundException($"Board with ID {boardDto.Id} not found");
            
        if (board.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the board owner can update the board");
            
        board.Title = boardDto.Title;
        board.Description = boardDto.Description;
        board.LastModifiedDate = DateTime.UtcNow;
        
        await _boardRepository.UpdateAsync(board);
        var owner = await _userRepository.GetByIdAsync(board.OwnerId);
        
        return BoardMapper.ToDto(board);
    }

    public async Task<bool> DeleteBoardAsync(long boardId, long userId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        if (board == null)
            return false;
            
        if (board.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the board owner can delete the board");
            
        return await _boardRepository.DeleteAsync(boardId);
    }

    public async Task<bool> HasAccessToBoardAsync(long boardId, long userId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        if (board == null)
            return false;
            
        // Board owner has access
        if (board.OwnerId == userId)
            return true;
            
        // Check if user is a board member
        return await _boardMemberRepository.GetQueryable()
            .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId);
    }

    public async Task<BoardMemberDto> AddBoardMemberAsync(long boardId, long userId, long memberUserId, SDP.TaskManagement.Domain.Entities.BoardMemberRole role)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        if (board == null)
            throw new KeyNotFoundException($"Board with ID {boardId} not found");
            
        // Only board owner or admin members can add members
        if (board.OwnerId != userId && !await IsBoardAdminAsync(boardId, userId))
            throw new UnauthorizedAccessException("You don't have permission to add members to this board");
            
        // Check if user exists
        var memberUser = await _userRepository.GetByIdAsync(memberUserId);
        if (memberUser == null)
            throw new KeyNotFoundException($"User with ID {memberUserId} not found");
            
        // Check if user is already a member
        var existingMember = await _boardMemberRepository.GetQueryable()
            .FirstOrDefaultAsync(bm => bm.BoardId == boardId && bm.UserId == memberUserId);
            
        if (existingMember != null)
            throw new InvalidOperationException("User is already a member of this board");
            
        var boardMember = new BoardMember
        {
            BoardId = boardId,
            UserId = memberUserId,
            Role = role,
            JoinedDate = DateTime.UtcNow,
            InviterId = userId,
            User = null!,
            Board = null!,
            Inviter = null!
        };
        
        await _boardMemberRepository.AddAsync(boardMember);
        
        var invitedBy = await _userRepository.GetByIdAsync(userId);
        
        return boardMember.ToDto(memberUser, board, invitedBy);
    }

    public async Task<bool> RemoveBoardMemberAsync(long boardId, long userId, long memberUserId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        if (board == null)
            return false;
            
        // Only board owner or admin members can remove members
        if (board.OwnerId != userId && !await IsBoardAdminAsync(boardId, userId))
            throw new UnauthorizedAccessException("You don't have permission to remove members from this board");
            
        // Board owner cannot be removed
        if (memberUserId == board.OwnerId)
            throw new InvalidOperationException("The board owner cannot be removed");
            
        // Find the board member
        var boardMember = await _boardMemberRepository.GetQueryable()
            .FirstOrDefaultAsync(bm => bm.BoardId == boardId && bm.UserId == memberUserId);
            
        if (boardMember == null)
            return false;
            
        return await _boardMemberRepository.DeleteAsync(boardMember.Id);
    }

    public async Task<IEnumerable<BoardMemberDto>> GetBoardMembersAsync(long boardId, long userId)
    {
        if (!await HasAccessToBoardAsync(boardId, userId))
            throw new UnauthorizedAccessException("You don't have access to this board");
            
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        var boardMembers = await _boardMemberRepository.GetQueryable()
            .Where(bm => bm.BoardId == boardId)
            .ToListAsync();
            
        var userIds = boardMembers.Select(bm => bm.UserId)
            .Concat(boardMembers.Select(bm => bm.InviterId ?? 0).Where(id => id > 0))
            .Distinct()
            .ToList();
            
        var users = await _userRepository.GetQueryable()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u);
            
        return boardMembers.Select(bm => bm.ToDto(
            users.GetValueOrDefault(bm.UserId),
            board,
            bm.InviterId.HasValue ? users.GetValueOrDefault(bm.InviterId.Value) : null));
    }

    private async Task<bool> IsBoardAdminAsync(long boardId, long userId)
    {
        return await _boardMemberRepository.GetQueryable()
            .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId && bm.Role == Domain.Entities.BoardMemberRole.Admin);
    }
}
