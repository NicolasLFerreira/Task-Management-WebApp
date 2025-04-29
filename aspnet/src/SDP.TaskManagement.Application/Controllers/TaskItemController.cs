using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using SDP.TaskManagement.Application.Abstractions;
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
    public async Task<ActionResult<TaskItem?>> GetTaskItem(Guid id)
    {
        var result = await _repository.GetByIdAsync(id);

        if (result == null)
            return NotFound("The given id does not match any existing entry.");

        return Ok(result);
    }

    [HttpPost(Name = "PostTaskItem")]
    public async Task<IActionResult> PostTaskItem(TaskItem taskItem)
    {
        await _repository.AddAsync(taskItem);

        // Optionally return the location of the new resource
        return CreatedAtRoute("GetTaskItem", new { id = taskItem.Id }, taskItem);
    }
}
