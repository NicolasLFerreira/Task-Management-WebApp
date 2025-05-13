using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/lists")]
[Authorize]
public class ListController : ControllerBase
{
    private readonly IRepository<List> _listRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;

    public ListController(
        IRepository<List> listRepository,
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository)
    {
        _listRepository = listRepository;
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
    }

    [HttpGet("board/{boardId}")]
    public async Task<ActionResult<List<ListDto>>> GetBoardLists(long boardId)
    {
        var userId = GetCurrentUserId();
        
        // Check if user has access to the board
        if (!await HasBoardAccess(userId, boardId))
            return Forbid("You don't have access to this board");
            
        var lists = await _listRepository.GetQueryable()
            .Where(l => l.BoardId == boardId)
            .OrderBy(l => l.Position)
            .ToListAsync();
            
        var listDtos = lists.Select(l => new ListDto
        {
            Id = l.Id,
            Title = l.Title,
            BoardId = l.BoardId,
            Position = l.Position
        }).ToList();
        
        return Ok(listDtos);
    }

    [HttpGet("{listId}")]
    public async Task<ActionResult<ListDto>> GetList(long listId)
    {
        var userId = GetCurrentUserId();
        
        var list = await _listRepository.GetByIdAsync(listId);
        
        if (list == null)
            return NotFound($"List with ID {listId} not found");
            
        // Check if user has access to the board
        if (!await HasBoardAccess(userId, list.BoardId))
            return Forbid("You don't have access to this board");
            
        var listDto = new ListDto
        {
            Id = list.Id,
            Title = list.Title,
            BoardId = list.BoardId,
            Position = list.Position
        };
        
        return Ok(listDto);
    }

    [HttpPost]
    public async Task<ActionResult<ListDto>> CreateList([FromBody] ListDto listDto)
    {
        var userId = GetCurrentUserId();
        
        // Check if user has access to the board
        if (!await HasBoardAccess(userId, listDto.BoardId))
            return Forbid("You don't have access to this board");
            
        // Get the highest position in the board
        var maxPosition = await _listRepository.GetQueryable()
            .Where(l => l.BoardId == listDto.BoardId)
            .Select(l => (int?)l.Position)
            .MaxAsync() ?? -1;
            
        var board = await _boardRepository.GetByIdAsync(listDto.BoardId);
        if (board == null)
            return NotFound($"Board with ID {listDto.BoardId} not found");

        var list = new List
        {
            Title = listDto.Title,
            BoardId = listDto.BoardId,
            Position = maxPosition + 1,
            Board = board
        };
        
        var result = await _listRepository.AddAsync(list);
        
        if (!result)
            return BadRequest("Failed to create list");
            
        listDto.Id = list.Id;
        listDto.Position = list.Position;
        
        return CreatedAtAction(nameof(GetList), new { listId = list.Id }, listDto);
    }

    [HttpPut("{listId}")]
    public async Task<ActionResult> UpdateList(long listId, [FromBody] ListDto listDto)
    {
        var userId = GetCurrentUserId();
        
        var list = await _listRepository.GetByIdAsync(listId);
        
        if (list == null)
            return NotFound($"List with ID {listId} not found");
            
        // Check if user has access to the board
        if (!await HasBoardAccess(userId, list.BoardId))
            return Forbid("You don't have access to this board");
            
        list.Title = listDto.Title;
        
        var result = await _listRepository.UpdateAsync(list);
        
        if (!result)
            return BadRequest("Failed to update list");
            
        return NoContent();
    }

    [HttpDelete("{listId}")]
    public async Task<ActionResult> DeleteList(long listId)
    {
        var userId = GetCurrentUserId();
        
        var list = await _listRepository.GetByIdAsync(listId);
        
        if (list == null)
            return NotFound($"List with ID {listId} not found");
            
        // Check if user has access to the board
        if (!await HasBoardAccess(userId, list.BoardId))
            return Forbid("You don't have access to this board");
            
        var result = await _listRepository.DeleteAsync(listId);
        
        if (!result)
            return BadRequest("Failed to delete list");
            
        // Reorder remaining lists
        var remainingLists = await _listRepository.GetQueryable()
            .Where(l => l.BoardId == list.BoardId && l.Position > list.Position)
            .OrderBy(l => l.Position)
            .ToListAsync();
            
        foreach (var remainingList in remainingLists)
        {
            remainingList.Position--;
            await _listRepository.UpdateAsync(remainingList);
        }
        
        return NoContent();
    }

    [HttpPost("reorder")]
    public async Task<ActionResult> ReorderLists([FromBody] ReorderListsDto reorderDto)
    {
        var userId = GetCurrentUserId();
        
        // Check if user has access to the board
        if (!await HasBoardAccess(userId, reorderDto.BoardId))
            return Forbid("You don't have access to this board");
            
        // Validate that all lists belong to the specified board
        var boardLists = await _listRepository.GetQueryable()
            .Where(l => l.BoardId == reorderDto.BoardId)
            .ToListAsync();
            
        var boardListIds = boardLists.Select(l => l.Id).ToHashSet();
        
        if (!reorderDto.ListIds.All(id => boardListIds.Contains(id)))
            return BadRequest("Some lists do not belong to the specified board");
            
        // Update positions
        for (int i = 0; i < reorderDto.ListIds.Count; i++)
        {
            var list = boardLists.First(l => l.Id == reorderDto.ListIds[i]);
            list.Position = i;
            await _listRepository.UpdateAsync(list);
        }
        
        return NoContent();
    }
    
    private async Task<bool> HasBoardAccess(long userId, long boardId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        if (board == null)
            return false;
            
        if (board.OwnerId == userId)
            return true;
            
        return await _boardMemberRepository.GetQueryable()
            .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId);
    }
    
    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return long.Parse(userIdClaim.Value);
    }
}

public class ReorderListsDto
{
    public long BoardId { get; set; }
    public List<long> ListIds { get; set; } = new List<long>();
}
