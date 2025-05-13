using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/checklists")]
[Authorize]
public class ChecklistController : ControllerBase
{
    private readonly IRepository<Checklist> _checklistRepository;
    private readonly IRepository<ChecklistItem> _checklistItemRepository;
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IRepository<List> _listRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;

    public ChecklistController(
        IRepository<Checklist> checklistRepository,
        IRepository<ChecklistItem> checklistItemRepository,
        IRepository<TaskItem> taskRepository,
        IRepository<List> listRepository,
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository)
    {
        _checklistRepository = checklistRepository;
        _checklistItemRepository = checklistItemRepository;
        _taskRepository = taskRepository;
        _listRepository = listRepository;
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<List<ChecklistDto>>> GetTaskChecklists(long taskId)
    {
        var userId = GetCurrentUserId();
        
        var task = await _taskRepository.GetByIdAsync(taskId);
        
        if (task == null)
            return NotFound($"Task with ID {taskId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var checklists = await _checklistRepository.GetQueryable()
            .Where(c => c.TaskItemId == taskId)
            .Include(c => c.Items)
            .ToListAsync();
            
        var checklistDtos = checklists.Select(c => new ChecklistDto
        {
            Id = c.Id,
            Title = c.Title,
            TaskItemId = c.TaskItemId,
            Items = c.Items?.Select(i => new ChecklistItemDto
            {
                Id = i.Id,
                Content = i.Content,
                IsChecked = i.IsChecked,
                ChecklistId = i.ChecklistId
            }).ToList() ?? new List<ChecklistItemDto>()
        }).ToList();
        
        return Ok(checklistDtos);
    }

    [HttpGet("{checklistId}")]
    public async Task<ActionResult<ChecklistDto>> GetChecklist(long checklistId)
    {
        var userId = GetCurrentUserId();
        
        var checklist = await _checklistRepository.GetQueryable()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == checklistId);
            
        if (checklist == null)
            return NotFound($"Checklist with ID {checklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var checklistDto = new ChecklistDto
        {
            Id = checklist.Id,
            Title = checklist.Title,
            TaskItemId = checklist.TaskItemId,
            Items = checklist.Items?.Select(i => new ChecklistItemDto
            {
                Id = i.Id,
                Content = i.Content,
                IsChecked = i.IsChecked,
                ChecklistId = i.ChecklistId
            }).ToList() ?? new List<ChecklistItemDto>()
        };
        
        return Ok(checklistDto);
    }

    [HttpPost]
    public async Task<ActionResult<ChecklistDto>> CreateChecklist([FromBody] ChecklistDto checklistDto)
    {
        var userId = GetCurrentUserId();
        
        var task = await _taskRepository.GetByIdAsync(checklistDto.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklistDto.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var checklist = new Checklist
        {
            Title = checklistDto.Title,
            TaskItemId = checklistDto.TaskItemId
        };
        
        var result = await _checklistRepository.AddAsync(checklist);
        
        if (!result)
            return BadRequest("Failed to create checklist");
            
        checklistDto.Id = checklist.Id;
        checklistDto.Items = new List<ChecklistItemDto>();
        
        return CreatedAtAction(nameof(GetChecklist), new { checklistId = checklist.Id }, checklistDto);
    }

    [HttpPut("{checklistId}")]
    public async Task<ActionResult> UpdateChecklist(long checklistId, [FromBody] ChecklistDto checklistDto)
    {
        var userId = GetCurrentUserId();
        
        var checklist = await _checklistRepository.GetByIdAsync(checklistId);
        
        if (checklist == null)
            return NotFound($"Checklist with ID {checklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        checklist.Title = checklistDto.Title;
        
        var result = await _checklistRepository.UpdateAsync(checklist);
        
        if (!result)
            return BadRequest("Failed to update checklist");
            
        return NoContent();
    }

    [HttpDelete("{checklistId}")]
    public async Task<ActionResult> DeleteChecklist(long checklistId)
    {
        var userId = GetCurrentUserId();
        
        var checklist = await _checklistRepository.GetByIdAsync(checklistId);
        
        if (checklist == null)
            return NotFound($"Checklist with ID {checklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var result = await _checklistRepository.DeleteAsync(checklistId);
        
        if (!result)
            return BadRequest("Failed to delete checklist");
            
        return NoContent();
    }

    [HttpPost("items")]
    public async Task<ActionResult<ChecklistItemDto>> CreateChecklistItem([FromBody] ChecklistItemDto itemDto)
    {
        var userId = GetCurrentUserId();
        
        var checklist = await _checklistRepository.GetByIdAsync(itemDto.ChecklistId);
        
        if (checklist == null)
            return NotFound($"Checklist with ID {itemDto.ChecklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var item = new ChecklistItem
        {
            Content = itemDto.Content,
            IsChecked = itemDto.IsChecked,
            ChecklistId = itemDto.ChecklistId
        };
        
        var result = await _checklistItemRepository.AddAsync(item);
        
        if (!result)
            return BadRequest("Failed to create checklist item");
            
        itemDto.Id = item.Id;
        
        return CreatedAtAction(nameof(GetChecklistItem), new { itemId = item.Id }, itemDto);
    }

    [HttpGet("items/{itemId}")]
    public async Task<ActionResult<ChecklistItemDto>> GetChecklistItem(long itemId)
    {
        var userId = GetCurrentUserId();
        
        var item = await _checklistItemRepository.GetByIdAsync(itemId);
        
        if (item == null)
            return NotFound($"Checklist item with ID {itemId} not found");
            
        var checklist = await _checklistRepository.GetByIdAsync(item.ChecklistId);
        
        if (checklist == null)
            return NotFound($"Checklist with ID {item.ChecklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var itemDto = new ChecklistItemDto
        {
            Id = item.Id,
            Content = item.Content,
            IsChecked = item.IsChecked,
            ChecklistId = item.ChecklistId
        };
        
        return Ok(itemDto);
    }

    [HttpPut("items/{itemId}")]
    public async Task<ActionResult> UpdateChecklistItem(long itemId, [FromBody] ChecklistItemDto itemDto)
    {
        var userId = GetCurrentUserId();
        
        var item = await _checklistItemRepository.GetByIdAsync(itemId);
        
        if (item == null)
            return NotFound($"Checklist item with ID {itemId} not found");
            
        var checklist = await _checklistRepository.GetByIdAsync(item.ChecklistId);
        
        if (checklist == null)
            return NotFound($"Checklist with ID {item.ChecklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        item.Content = itemDto.Content;
        item.IsChecked = itemDto.IsChecked;
        
        var result = await _checklistItemRepository.UpdateAsync(item);
        
        if (!result)
            return BadRequest("Failed to update checklist item");
            
        return NoContent();
    }

    [HttpDelete("items/{itemId}")]
    public async Task<ActionResult> DeleteChecklistItem(long itemId)
    {
        var userId = GetCurrentUserId();
        
        var item = await _checklistItemRepository.GetByIdAsync(itemId);
        
        if (item == null)
            return NotFound($"Checklist item with ID {itemId} not found");
            
        var checklist = await _checklistRepository.GetByIdAsync(item.ChecklistId);
        
        if (checklist == null)
            return NotFound($"Checklist with ID {item.ChecklistId} not found");
            
        var task = await _taskRepository.GetByIdAsync(checklist.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {checklist.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var result = await _checklistItemRepository.DeleteAsync(itemId);
        
        if (!result)
            return BadRequest("Failed to delete checklist item");
            
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
    
    private async Task<bool> HasTaskAccess(long userId, TaskItem task)
    {
        // Task owner has access
        if (task.OwnerUserId == userId)
            return true;
            
        // Task assignee has access
        if (task.Assignees != null && task.Assignees.Any(a => a.Id == userId))
            return true;
            
        // Board owner or member has access
        var list = await _listRepository.GetByIdAsync(task.ListId);
        
        if (list == null)
            return false;
            
        return await HasBoardAccess(userId, list.BoardId);
    }
    
    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return long.Parse(userIdClaim.Value);
    }
}
