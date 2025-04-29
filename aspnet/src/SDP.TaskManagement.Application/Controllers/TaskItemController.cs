using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemController : ControllerBase
{
    private readonly ILogger<TaskItemController> _logger;
    private readonly IRepository<TaskItem, Guid> _repository;

    public TaskItemController(ILogger<TaskItemController> logger, IRepository<TaskItem, Guid> repository)
    {
        _logger = logger;
        _repository = repository;
    }

    [HttpGet(Name = "GetTaskItem")]
    public async Task<TaskItem?> GetTaskItem(Guid id)
    {
        return await _repository.GetByIdAsync(id) ?? null;
    }

    [HttpPost(Name = "PostTaskItem")]
    public async Task PostTaskItem(TaskItem taskItem)
    {
        await _repository.AddAsync(taskItem);
    }
}
