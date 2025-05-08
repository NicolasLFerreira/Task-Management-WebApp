using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/tasks")]
public class TaskItemController : ControllerBase
{
    private readonly IRepository<TaskItem> _repository;

    public TaskItemController(IRepository<TaskItem> repository)
    {
        _repository = repository;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskItemDto taskItemDto)
    {
        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        var result = await _repository.AddAsync(taskItem);

        return result
            ? Created()
            : BadRequest("Failed to create entity.");
    }

    [HttpGet("{taskItemId:long}")]
    public async Task<ActionResult<TaskItemDto?>> GetById(long taskItemId)
    {
        var result = await _repository.GetByIdAsync(taskItemId);

        if (result == null)
            return NotFound($"Entity with Id '{taskItemId}' does not exist.");

        var dto = TaskItemMapper.ToDto(result);

        return Ok(dto);
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskItem>>> GetAll()
    {
        var result = await _repository
            .GetQueryable()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("user/{userId:long}")]
    public async Task<ActionResult<List<TaskItem>>> GetByUserId(long userId)
    {
        var result = await _repository
            .GetQueryable()
            .Where(e => e.OwnerUserId == userId)
            .ToListAsync();

        return Ok(result);
    }

    [HttpPut("{taskItemId:long}")]
    public async Task<IActionResult> Update(long taskItemId, [FromBody] TaskItemDto taskItemDto)
    {
        if (taskItemId != taskItemDto.Id)
        {
            return BadRequest("Id mismatch");
        }

        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        var result = await _repository.UpdateAsync(taskItem);

        return result
            ? Ok()
            : NotFound($"Entity with Id '{taskItemId}' does not exist.");
    }

    [HttpDelete("{taskItemId:long}")]
    public async Task<IActionResult> Delete(long taskItemId)
    {
        var result = await _repository.DeleteAsync(taskItemId);

        return result
            ? Ok()
            : NotFound($"Entity with Id '{taskItemId}' does not exist.");
    }
}