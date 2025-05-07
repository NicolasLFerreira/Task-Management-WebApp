using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemController : ControllerBase
{
    private readonly IRepository<TaskItem> _repository;

    public TaskItemController(IRepository<TaskItem> repository)
    {
        _repository = repository;
    }

    [HttpPost("AddTaskItem")]
    public async Task<IActionResult> AddTaskItem(TaskItemDto taskItemDto)
    {
        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        var result = await _repository.AddAsync(taskItem);

        return result
            ? Ok()
            : Ok($"Good request, but could not find TaskItem with Id '{taskItem.Id}'");
    }

    [HttpGet("GetTaskItem/{taskItemId:long}")]
    public async Task<ActionResult<TaskItemDto?>> GetTaskItem(long taskItemId)
    {
        var result = await _repository.GetByIdAsync(taskItemId);

        if (result == null)
            return Ok($"Good request, but could not find TaskItem with Id '{taskItemId}'");

        var dto = TaskItemMapper.ToDto(result);

        return Ok(dto);
    }

    [HttpGet("GetAllTaskItems")]
    public async Task<ActionResult<List<TaskItem>>> GetAllTaskItems()
    {
        var result = await _repository
            .GetQueryable()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("GetTaskItemByUser/{userId:long}")]
    public async Task<ActionResult<List<TaskItem>>> GetTaskItemsByUser(long userId)
    {
        var result = await _repository
            .GetQueryable()
            .Where(e => e.OwnerUserId == userId)
            .ToListAsync();

        return Ok(result);
    }

    [HttpPut("UpdateTaskItem")]
    public async Task<IActionResult> UpdateTaskItem(TaskItemDto taskItemDto)
    {
        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        var result = await _repository.UpdateAsync(taskItem);

        return result
            ? Ok()
            : Ok($"Good request, but could not find TaskItem with Id '{taskItem.Id}'");
    }

    [HttpDelete("DeleteTaskItem/{taskItemId:long}")]
    public async Task<IActionResult> DeleteTaskItem(long taskItemId)
    {
        var result = await _repository.DeleteAsync(taskItemId);

        return result
            ? Ok()
            : Ok($"Good request, but could not find TaskItem with Id '{taskItemId}'");
    }
}