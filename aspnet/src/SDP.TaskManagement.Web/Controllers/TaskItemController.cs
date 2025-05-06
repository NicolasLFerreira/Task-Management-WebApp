using Microsoft.AspNetCore.Mvc;

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

    [HttpGet(Name = "GetTaskItem")]
    public async Task<ActionResult<TaskItemDto?>> GetTaskItem(Guid id)
    {
        var result = await _repository.GetByIdAsync(id);

        if (result == null)
            return NotFound("The given id does not match any existing entry.");

        var dto = TaskItemMapper.ToDto(result);

        return Ok(dto);
    }

    [HttpPost(Name = "AddTaskItem")]
    public async Task<IActionResult> AddTaskItem(TaskItemDto taskItemDto)
    {
        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        await _repository.AddAsync(taskItem);

        return Ok();
    }

    [HttpPut(Name = "UpdateTaskItem")]
    public async Task<IActionResult> UpdateTaskItem(TaskItemDto taskItemDto)
    {
        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        return null;
    }
}
