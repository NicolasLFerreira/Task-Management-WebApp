using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/tasks/editing")]
[Authorize]
public class TaskItemEditingController : ControllerBase
{
    private readonly IRepository<TaskItem> _repository;

    public TaskItemEditingController(IRepository<TaskItem> repository)
    {
        _repository = repository;
    }

    [HttpPut("{taskItemId:long}")]
    public async Task<IActionResult> EditStatusOrPriority(long taskItemId, [FromBody] EditStatusOrPriorityInput input)
    {
        var entity = await _repository.GetByIdAsync(taskItemId);

        if (entity == null)
        {
            return NotFound("Id does not exist.");
        }

        if (input.Priority != null)
            entity.Priority = input.Priority.Value;

        if (input.ProgressStatus != null)
            entity.ProgressStatus = input.ProgressStatus.Value;

        var result = await _repository.UpdateAsync(entity);

        return result
            ? Created()
            : Problem("Failed to update record.");
    }
}

public sealed class EditStatusOrPriorityInput()
{
    public TaskItemStatus? ProgressStatus { get; set; }
    public TaskItemPriority? Priority { get; set; }
}
