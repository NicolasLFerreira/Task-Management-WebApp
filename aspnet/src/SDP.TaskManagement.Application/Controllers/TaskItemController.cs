using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemController : ControllerBase
{
    private readonly ILogger<TaskItemController> _logger;

    public TaskItemController(ILogger<TaskItemController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetTaskItem")]
    public TaskItem GetTaskItem()
    {
        return new TaskItem
        {
            Title = "Task n1",
        };
    }
}
