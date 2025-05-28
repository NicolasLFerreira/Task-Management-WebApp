using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TaskItemController : ControllerBase
{
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IRepository<List> _listRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;
    private readonly IRepository<User> _userRepository;

    public TaskItemController(
        IRepository<TaskItem> taskRepository,
        IRepository<List> listRepository,
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository,
        IRepository<User> userRepository)
    {
        _taskRepository = taskRepository;
        _listRepository = listRepository;
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskItemDto>>> GetUserTasks()
    {
        var userId = GetCurrentUserId();

        var tasks = await _taskRepository.GetQueryable()
            .Where(t => t.OwnerUserId == userId || t.Assignees.Any(a => a.Id == userId))
            .Include(t => t.Labels)
            .Include(t => t.Assignees)
            .ToListAsync();

        var taskDtos = tasks.Select(TaskItemMapper.ToDto).ToList();

        return Ok(taskDtos);
    }

    [HttpGet("{taskId}")]
    public async Task<ActionResult<TaskItemDto>> GetTask(long taskId)
    {
        var userId = GetCurrentUserId();

        var task = await _taskRepository.GetQueryable()
            .Include(t => t.Labels)
            .Include(t => t.Assignees)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            return NotFound($"Task with ID {taskId} not found");

        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");

        var taskDto = TaskItemMapper.ToDto(task);

        return Ok(taskDto);
    }

    [HttpGet("list/{listId}")]
    public async Task<ActionResult<List<TaskItemDto>>> GetTasksByList(long listId)
    {
        var userId = GetCurrentUserId();

        var list = await _listRepository.GetByIdAsync(listId);

        if (list == null)
            return NotFound($"List with ID {listId} not found");

        // Check if user has access to the board
        if (!await HasBoardAccess(userId, list.BoardId))
            return Forbid("You don't have access to this board");

        var tasks = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == listId)
            .OrderBy(t => t.Position)
            .ToListAsync();

        var taskDtos = tasks.Select(TaskItemMapper.ToDto).ToList();

        return Ok(taskDtos);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> CreateTask([FromBody] TaskItemCreationDto taskDto)
    {
        var userId = GetCurrentUserId();

        var list = await _listRepository.GetByIdAsync(taskDto.ListId);

        if (list == null)
            return NotFound($"List with ID {taskDto.ListId} not found");

        // Check if user has access to the board
        if (!await HasBoardAccess(userId, list.BoardId))
            return Forbid("You don't have access to this board");

        // Get the highest position in the list
        var maxPosition = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == taskDto.ListId)
            .Select(t => t.Position)
            .OrderByDescending(a => a)
            .FirstOrDefaultAsync();

        var task = new TaskItem
        {
            Title = taskDto.Title,
            Description = taskDto.Description,
            DueDate = taskDto.DueDate,
            Priority = taskDto.Priority,
            ProgressStatus = taskDto.ProgressStatus,
            OwnerUserId = userId,
            ListId = taskDto.ListId,
            Position = maxPosition + 1,
            CreatedAt = DateTime.UtcNow,
        };

        var result = await _taskRepository.AddAsync(task);

        if (!result)
            return BadRequest("Failed to create task");

        return Ok();
    }

    [HttpPut("{taskId}")]
    public async Task<ActionResult> UpdateTask(long taskId, [FromBody] TaskItemDto taskDto)
    {
        var userId = GetCurrentUserId();

        var task = await _taskRepository.GetByIdAsync(taskId);

        if (task == null)
            return NotFound($"Task with ID {taskId} not found");

        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");

        task.Title = taskDto.Title;
        task.Description = taskDto.Description;
        task.DueDate = taskDto.DueDate;
        task.Priority = taskDto.Priority;
        task.ProgressStatus = taskDto.ProgressStatus;
        task.UpdatedAt = DateTime.UtcNow;

        var result = await _taskRepository.UpdateAsync(task);

        if (!result)
            return BadRequest("Failed to update task");

        return NoContent();
    }

    [HttpDelete("{taskId}")]
    public async Task<ActionResult> DeleteTask(long taskId)
    {
        var userId = GetCurrentUserId();

        var task = await _taskRepository.GetByIdAsync(taskId);

        if (task == null)
            return NotFound($"Task with ID {taskId} not found");

        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");

        var result = await _taskRepository.DeleteAsync(taskId);

        if (!result)
            return BadRequest("Failed to delete task");

        // Reorder remaining tasks
        var remainingTasks = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == task.ListId && t.Position > task.Position)
            .OrderBy(t => t.Position)
            .ToListAsync();

        foreach (var remainingTask in remainingTasks)
        {
            remainingTask.Position--;
            await _taskRepository.UpdateAsync(remainingTask);
        }

        return NoContent();
    }

    [HttpPost("move")]
    public async Task<ActionResult> MoveTask([FromBody] MoveTaskDto moveDto)
    {
        var userId = GetCurrentUserId();

        var task = await _taskRepository.GetByIdAsync(moveDto.TaskId);

        if (task == null)
            return NotFound($"Task with ID {moveDto.TaskId} not found");

        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");

        var targetList = await _listRepository.GetByIdAsync(moveDto.TargetListId);

        if (targetList == null)
            return NotFound($"List with ID {moveDto.TargetListId} not found");

        // Check if user has access to the target board
        if (!await HasBoardAccess(userId, targetList.BoardId))
            return Forbid("You don't have access to the target board");

        // If moving within the same list
        if (task.ListId == moveDto.TargetListId)
        {
            // Reorder tasks in the list
            var tasksToUpdate = await _taskRepository.GetQueryable()
                .Where(t => t.ListId == task.ListId && t.Id != task.Id)
                .OrderBy(t => t.Position)
                .ToListAsync();

            var updatedTasks = new List<TaskItem>();

            for (int i = 0, newPosition = 0; i < tasksToUpdate.Count + 1; i++, newPosition++)
            {
                if (newPosition == moveDto.Position)
                {
                    task.Position = newPosition;
                    newPosition++;
                }

                if (i < tasksToUpdate.Count)
                {
                    tasksToUpdate[i].Position = newPosition;
                    updatedTasks.Add(tasksToUpdate[i]);
                }
            }

            foreach (var t in updatedTasks)
            {
                await _taskRepository.UpdateAsync(t);
            }
        }
        else
        {
            // Moving to a different list

            // Reorder tasks in the source list
            var sourceListTasks = await _taskRepository.GetQueryable()
                .Where(t => t.ListId == task.ListId && t.Id != task.Id && t.Position > task.Position)
                .OrderBy(t => t.Position)
                .ToListAsync();

            foreach (var t in sourceListTasks)
            {
                t.Position--;
                await _taskRepository.UpdateAsync(t);
            }

            // Reorder tasks in the target list
            var targetListTasks = await _taskRepository.GetQueryable()
                .Where(t => t.ListId == moveDto.TargetListId && t.Position >= moveDto.Position)
                .OrderBy(t => t.Position)
                .ToListAsync();

            foreach (var t in targetListTasks)
            {
                t.Position++;
                await _taskRepository.UpdateAsync(t);
            }

            // Update the task
            task.ListId = moveDto.TargetListId;
            task.Position = moveDto.Position;
        }

        var result = await _taskRepository.UpdateAsync(task);

        if (!result)
            return BadRequest("Failed to move task");

        return NoContent();
    }

    [HttpPost("reorder")]
    public async Task<ActionResult> ReorderTasks([FromBody] ReorderTasksDto reorderDto)
    {
        var userId = GetCurrentUserId();

        var list = await _listRepository.GetByIdAsync(reorderDto.ListId);

        if (list == null)
            return NotFound($"List with ID {reorderDto.ListId} not found");

        // Check if user has access to the board
        if (!await HasBoardAccess(userId, list.BoardId))
            return Forbid("You don't have access to this board");

        // Validate that all tasks belong to the specified list
        var listTasks = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == reorderDto.ListId)
            .ToListAsync();

        var listTaskIds = listTasks.Select(t => t.Id).ToHashSet();

        if (!reorderDto.TaskIds.All(id => listTaskIds.Contains(id)))
            return BadRequest("Some tasks do not belong to the specified list");

        // Update positions
        for (int i = 0; i < reorderDto.TaskIds.Count; i++)
        {
            var task = listTasks.First(t => t.Id == reorderDto.TaskIds[i]);
            task.Position = i;
            await _taskRepository.UpdateAsync(task);
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

public class MoveTaskDto
{
    public long TaskId { get; set; }
    public long TargetListId { get; set; }
    public int Position { get; set; }
}

public class ReorderTasksDto
{
    public long ListId { get; set; }
    public List<long> TaskIds { get; set; } = [];
}

public class TaskItemCreationDto
{
    public required string Title { get; set; }

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskItemPriority Priority { get; set; }

    public TaskItemStatus ProgressStatus { get; set; }

    public long ListId { get; set; }
}
