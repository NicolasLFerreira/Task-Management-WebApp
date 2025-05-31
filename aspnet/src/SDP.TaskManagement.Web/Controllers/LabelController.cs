using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/labels")]
[Authorize]
public class LabelController : ControllerBase
{
  private readonly IRepository<Label> _labelRepository;
  private readonly IRepository<Board> _boardRepository;
  private readonly IRepository<BoardMember> _boardMemberRepository;
  private readonly IRepository<TaskItem> _taskRepository;
  private readonly IRepository<List> _listRepository;
  private readonly IRepository<TaskItemLabel> _taskItemLabelRepository;

  public LabelController(
      IRepository<Label> labelRepository,
      IRepository<Board> boardRepository,
      IRepository<BoardMember> boardMemberRepository,
      IRepository<TaskItem> taskRepository,
      IRepository<List> listRepository,
      IRepository<TaskItemLabel> taskItemLabelRepository)
  {
      _labelRepository = labelRepository;
      _boardRepository = boardRepository;
      _boardMemberRepository = boardMemberRepository;
      _taskRepository = taskRepository;
      _listRepository = listRepository;
      _taskItemLabelRepository = taskItemLabelRepository;
  }

  [HttpGet("board/{boardId}")]
  public async Task<ActionResult<List<LabelDto>>> GetBoardLabels(long boardId)
  {
      var userId = GetCurrentUserId();
      
      // Check if user has access to the board
      if (!await HasBoardAccess(userId, boardId))
          return Forbid("You don't have access to this board");
          
      var labels = await _labelRepository.GetQueryable()
          .Where(l => l.BoardId == boardId)
          .ToListAsync();
          
      var labelDtos = labels.Select(l => new LabelDto
      {
          Id = l.Id,
          Name = l.Name,
          Color = l.Color,
          BoardId = l.BoardId
      }).ToList();
      
      return Ok(labelDtos);
  }

  [HttpGet("{labelId}")]
  public async Task<ActionResult<LabelDto>> GetLabel(long labelId)
  {
      var userId = GetCurrentUserId();
      
      var label = await _labelRepository.GetByIdAsync(labelId);
      
      if (label == null)
          return NotFound($"Label with ID {labelId} not found");
          
      // Check if user has access to the board
      if (!await HasBoardAccess(userId, label.BoardId))
          return Forbid("You don't have access to this board");
          
      var labelDto = new LabelDto
      {
          Id = label.Id,
          Name = label.Name,
          Color = label.Color,
          BoardId = label.BoardId
      };
      
      return Ok(labelDto);
  }

  [HttpPost]
  public async Task<ActionResult<LabelDto>> CreateLabel([FromBody] LabelDto labelDto)
  {
      var userId = GetCurrentUserId();
      
      // Check if user has access to the board
      if (!await HasBoardAccess(userId, labelDto.BoardId))
          return Forbid("You don't have access to this board");
          
      var board = await _boardRepository.GetByIdAsync(labelDto.BoardId);
      
      if (board == null)
          return NotFound($"Board with ID {labelDto.BoardId} not found");
          
      var label = new Label
      {
          Name = labelDto.Name,
          Color = labelDto.Color,
          BoardId = labelDto.BoardId,
          Board = board
      };
      
      var result = await _labelRepository.AddAsync(label);
      
      if (!result)
          return BadRequest("Failed to create label");
          
      labelDto.Id = label.Id;
      
      return CreatedAtAction(nameof(GetLabel), new { labelId = label.Id }, labelDto);
  }

  [HttpPut("{labelId}")]
  public async Task<ActionResult> UpdateLabel(long labelId, [FromBody] LabelDto labelDto)
  {
      var userId = GetCurrentUserId();
      
      var label = await _labelRepository.GetByIdAsync(labelId);
      
      if (label == null)
          return NotFound($"Label with ID {labelId} not found");
          
      // Check if user has access to the board
      if (!await HasBoardAccess(userId, label.BoardId))
          return Forbid("You don't have access to this board");
          
      label.Name = labelDto.Name;
      label.Color = labelDto.Color;
      
      var result = await _labelRepository.UpdateAsync(label);
      
      if (!result)
          return BadRequest("Failed to update label");
          
      return NoContent();
  }

  [HttpDelete("{labelId}")]
  public async Task<ActionResult> DeleteLabel(long labelId)
  {
      var userId = GetCurrentUserId();
      
      var label = await _labelRepository.GetByIdAsync(labelId);
      
      if (label == null)
          return NotFound($"Label with ID {labelId} not found");
          
      // Check if user has access to the board
      if (!await HasBoardAccess(userId, label.BoardId))
          return Forbid("You don't have access to this board");
          
      var result = await _labelRepository.DeleteAsync(labelId);
      
      if (!result)
          return BadRequest("Failed to delete label");
          
      return NoContent();
  }

  [HttpGet("task/{taskId}")]
  public async Task<ActionResult<List<LabelDto>>> GetTaskLabels(long taskId)
  {
      var userId = GetCurrentUserId();

      var task = await _taskRepository.GetByIdAsync(taskId);

      if (task == null)
          return NotFound($"Task with ID {taskId} not found");

      // Check if user has access to the task
      if (!await HasTaskAccess(userId, task))
          return Forbid("You don't have access to this task");

      var labels = await _taskItemLabelRepository.GetQueryable()
          .Where(til => til.TaskItemId == taskId)
          .Select(til => til.Label) // Select the Label navigation property
          .ToListAsync();
      
      if (labels == null || !labels.Any())
          return Ok(new List<LabelDto>()); // Return empty list if no labels or Label is null

      var labelDtos = labels
          .Where(l => l != null) // Ensure label is not null before mapping
          .Select(l => new LabelDto
          {
              Id = l.Id,
              Name = l.Name,
              Color = l.Color,
              BoardId = l.BoardId
          }).ToList();

      return Ok(labelDtos);
  }

  [HttpPost("task/{taskId}/add/{labelId}")]
  public async Task<ActionResult> AddLabelToTask(long taskId, long labelId)
  {
      var userId = GetCurrentUserId();
      
      var task = await _taskRepository.GetQueryable()
          .Include(t => t.Labels)
          .FirstOrDefaultAsync(t => t.Id == taskId);
          
      if (task == null)
          return NotFound($"Task with ID {taskId} not found");
          
      var label = await _labelRepository.GetByIdAsync(labelId);
      
      if (label == null)
          return NotFound($"Label with ID {labelId} not found");
          
      // Check if user has access to the task
      if (!await HasTaskAccess(userId, task))
          return Forbid("You don't have access to this task");
          
      // Check if label belongs to the same board as the task
      var list = await _listRepository.GetByIdAsync(task.ListId);
      
      if (list == null || list.BoardId != label.BoardId)
          return BadRequest("Label does not belong to the same board as the task");
          
      // Check if label is already added to the task
      var existingTaskLabel = await _taskItemLabelRepository.GetQueryable()
          .AnyAsync(tl => tl.TaskItemId == taskId && tl.LabelId == labelId);
          
      if (existingTaskLabel)
          return BadRequest("Label is already added to the task");
          
      // Add label to task
      var taskItemLabel = new TaskItemLabel
      {
          TaskItemId = taskId,
          LabelId = label.Id,
          TaskItem = task,
          Label = label
      };
      
      await _taskItemLabelRepository.AddAsync(taskItemLabel);
      
      return NoContent();
  }

  [HttpPost("task/{taskId}/remove/{labelId}")]
  public async Task<ActionResult> RemoveLabelFromTask(long taskId, long labelId)
  {
      var userId = GetCurrentUserId();
      
      var task = await _taskRepository.GetByIdAsync(taskId);
          
      if (task == null)
          return NotFound($"Task with ID {taskId} not found");
          
      // Check if user has access to the task
      if (!await HasTaskAccess(userId, task))
          return Forbid("You don't have access to this task");
          
      // Check if label is added to the task
      var taskItemLabel = await _taskItemLabelRepository.GetQueryable()
          .FirstOrDefaultAsync(tl => tl.TaskItemId == taskId && tl.LabelId == labelId);
          
      if (taskItemLabel == null)
          return BadRequest("Label is not added to the task");
          
      // Remove label from task
      await _taskItemLabelRepository.DeleteAsync(taskItemLabel.Id);
      
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
