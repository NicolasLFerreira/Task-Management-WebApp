using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

using System.Security.Claims;

namespace SDP.TaskManagement.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaskItemController : ControllerBase
{
    private readonly IRepository<TaskItem, Guid> _repository;
    private readonly ILogger<TaskItemController> _logger;

    public TaskItemController(IRepository<TaskItem, Guid> repository, ILogger<TaskItemController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet("{id}", Name = "GetTaskItemById")]
    public async Task<ActionResult<TaskItemDto?>> GetTaskItemById(Guid id)
    {
        var result = await _repository.GetByIdAsync(id);

        if (result == null)
            return NotFound("The given id does not match any existing entry.");

        // Check if the task belongs to the current user
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (result.OwnerUserId.ToString() != userId)
            return Forbid();

        var dto = TaskItemMapper.ToDto(result);

        return Ok(dto);
    }

    [HttpGet(Name = "GetTaskItem")]
    public async Task<ActionResult<TaskItemDto?>> GetTaskItem(Guid id)
    {
        return await GetTaskItemById(id);
    }

    [HttpGet("all", Name = "GetAllTaskItems")]
    public ActionResult<IEnumerable<TaskItemDto>> GetAllTaskItems()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var userGuid = Guid.Parse(userId);
        var tasks = _repository.GetQueryable()
            .Where(t => t.OwnerUserId == userGuid)
            .Select(task => TaskItemMapper.ToDto(task))
            .ToList();

        return Ok(tasks);
    }

    [HttpPost(Name = "CreateTaskItem")]
    public async Task<IActionResult> CreateTaskItem(TaskItemDto taskItemDto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Ensure the task is assigned to the current user
            taskItemDto.OwnerUserId = Guid.Parse(userId);
            
            // Ensure dates are in UTC format
            taskItemDto.CreationTime = DateTime.SpecifyKind(taskItemDto.CreationTime, DateTimeKind.Utc);
            taskItemDto.DueDate = DateTime.SpecifyKind(taskItemDto.DueDate, DateTimeKind.Utc);
            
            _logger.LogInformation("Creating task with title: {Title}, DueDate: {DueDate}, CreationTime: {CreationTime}", 
                taskItemDto.Title, taskItemDto.DueDate, taskItemDto.CreationTime);
            
            var taskItem = TaskItemMapper.ToEntity(taskItemDto);

            await _repository.AddAsync(taskItem);

            return CreatedAtAction(nameof(GetTaskItemById), new { id = taskItem.Id }, TaskItemMapper.ToDto(taskItem));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task: {Message}", ex.Message);
            return StatusCode(500, new { error = "Failed to create task", details = ex.Message });
        }
    }

    [HttpPut("{id}", Name = "UpdateTaskItem")]
    public async Task<IActionResult> UpdateTaskItem(Guid id, TaskItemDto taskItemDto)
    {
        try
        {
            var existingTask = await _repository.GetByIdAsync(id);
            if (existingTask == null)
                return NotFound("Task not found.");

            // Check if the task belongs to the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (existingTask.OwnerUserId.ToString() != userId)
                return Forbid();

            // Ensure dates are in UTC format
            taskItemDto.DueDate = DateTime.SpecifyKind(taskItemDto.DueDate, DateTimeKind.Utc);
            
            // Update task properties
            existingTask.Title = taskItemDto.Title;
            existingTask.Description = taskItemDto.Description;
            existingTask.DueDate = taskItemDto.DueDate;
            existingTask.Priority = taskItemDto.Priority;
            existingTask.ProgressStatus = taskItemDto.ProgressStatus;

            // Save changes
            await _repository.UpdateAsync(existingTask);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task: {Message}", ex.Message);
            return StatusCode(500, new { error = "Failed to update task", details = ex.Message });
        }
    }

    [HttpDelete("{id}", Name = "DeleteTaskItem")]
    public async Task<IActionResult> DeleteTaskItem(Guid id)
    {
        try
        {
            var existingTask = await _repository.GetByIdAsync(id);
            if (existingTask == null)
                return NotFound("Task not found.");

            // Check if the task belongs to the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (existingTask.OwnerUserId.ToString() != userId)
                return Forbid();

            await _repository.DeleteAsync(id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task: {Message}", ex.Message);
            return StatusCode(500, new { error = "Failed to delete task", details = ex.Message });
        }
    }
}
