using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;

using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/boards")]
[Authorize]
public class BoardController : ControllerBase
{
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;

    public BoardController(IRepository<Board> boardRepository, IRepository<BoardMember> boardMemberRepository)
    {
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<BoardDto>>> GetUserBoards()
    {
        var userId = GetCurrentUserId();

        // Get boards where user is owner or member
        var ownedBoards = await _boardRepository.GetQueryable()
            .Where(b => b.OwnerId == userId)
            .Include(b => b.Owner)
            .ToListAsync();

        var memberBoardIds = await _boardMemberRepository.GetQueryable()
            .Where(bm => bm.UserId == userId)
            .Select(bm => bm.BoardId)
            .ToListAsync();

        var memberBoards = await _boardRepository.GetQueryable()
            .Where(b => memberBoardIds.Contains(b.Id))
            .ToListAsync();

        var allBoards = ownedBoards.Concat(memberBoards).Distinct().ToList();

        var boardDtos = allBoards.Select(b => new BoardDto
        {
            Id = b.Id,
            Title = b.Title,
            Description = b.Description,
            CreatedAt = b.CreatedAt,
            OwnerUsername = b.Owner!.Username
        }).ToList();

        return Ok(boardDtos);
    }

    [HttpGet("{boardId}")]
    public async Task<ActionResult<BoardDto>> GetBoard(long boardId)
    {
        var userId = GetCurrentUserId();

        var board = await _boardRepository.GetByIdAsyncWithNavigation(boardId, b => b.Owner!);

        if (board == null)
            return NotFound($"Board with ID {boardId} not found");

        // Check if user is owner or member
        if (board.OwnerId != userId)
        {
            var isMember = await _boardMemberRepository.GetQueryable()
                .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId);

            if (!isMember)
                return Forbid("You don't have access to this board");
        }

        var boardDto =

            new BoardDto
            {
                Id = board.Id,
                Title = board.Title,
                Description = board.Description,
                CreatedAt = board.CreatedAt,
                OwnerUsername = board.Owner!.Username
            };

        return Ok(boardDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] BoardDto boardDto)
    {
        var userId = GetCurrentUserId();

        var board = new Board
        {
            Title = boardDto.Title,
            Description = boardDto.Description,
            CreatedAt = DateTime.UtcNow,
            OwnerId = userId
        };

        var result = await _boardRepository.AddAsync(board);

        if (!result)
            return BadRequest("Failed to create board");

        return Ok();
    }

    [HttpPut("{boardId}")]
    public async Task<ActionResult> UpdateBoard(long boardId, [FromBody] BoardDto boardDto)
    {
        var userId = GetCurrentUserId();

        var board = await _boardRepository.GetByIdAsync(boardId);

        if (board == null)
            return NotFound($"Board with ID {boardId} not found");

        // Only owner can update board
        if (board.OwnerId != userId)
            return Forbid("Only the board owner can update the board");

        board.Title = boardDto.Title;
        board.Description = boardDto.Description;

        var result = await _boardRepository.UpdateAsync(board);

        if (!result)
            return BadRequest("Failed to update board");

        return NoContent();
    }

    [HttpDelete("{boardId}")]
    public async Task<ActionResult> DeleteBoard(long boardId)
    {
        var userId = GetCurrentUserId();

        var board = await _boardRepository.GetByIdAsync(boardId);

        if (board == null)
            return NotFound($"Board with ID {boardId} not found");

        // Only owner can delete board
        if (board.OwnerId != userId)
            return Forbid("Only the board owner can delete the board");

        var result = await _boardRepository.DeleteAsync(boardId);

        if (!result)
            return BadRequest("Failed to delete board");

        return NoContent();
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return long.Parse(userIdClaim.Value);
    }
}
