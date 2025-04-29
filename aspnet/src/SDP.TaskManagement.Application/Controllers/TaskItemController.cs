using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemController : ControllerBase
{
    private readonly IRepository<TaskItem, Guid> _repository;

    public TaskItemController(IRepository<TaskItem, Guid> repository)
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

    [HttpPost(Name = "PostTaskItem")]
    public async Task<IActionResult> PostTaskItem(TaskItemDto taskItemDto)
    {
        var taskItem = TaskItemMapper.ToEntity(taskItemDto);

        await _repository.AddAsync(taskItem);

        return Ok();
    }
}
