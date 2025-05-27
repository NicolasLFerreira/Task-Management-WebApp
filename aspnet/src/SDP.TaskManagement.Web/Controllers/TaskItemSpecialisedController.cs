using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using SDP.TaskManagement.Infrastructure.Extensions;

namespace SDP.TaskManagement.Web.Controllers;

[Route("api/tasks/querying/")]
public class TaskItemSpecialisedController : ControllerBase
{
    private readonly IRepository<TaskItem> _repository;

    public TaskItemSpecialisedController(IRepository<TaskItem> repository)
    {
        _repository = repository;
    }

    [HttpGet("{titlePattern}")]
    public async Task<ActionResult<List<TaskItemDto>>> SearchByTitle(string titlePattern)
    {
        var result = await _repository
            .GetQueryable()
            .Where(e => e.Title.Contains(titlePattern))
            .ToListAsync();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<List<TaskItemDto>>> FilterByProperty([FromBody] FilterTaskItemInputDto input)
    {
            var result = await _repository
            .GetQueryable()
            .WhereIf(input.Title != null, e => e.Title.Contains(input.Title!))
            .WhereIf(input.Description != null, e => e.Description != null && e.Description.Contains(input.Description!))
            .WhereIf(input.Status != null, e => e.ProgressStatus == input.Status)
            .WhereIf(input.Priority != null, e => e.Priority == input.Priority)
            .ToListAsync();

        return Ok(result);
    }
}

public sealed class FilterTaskItemInputDto()
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public TaskItemPriority? Priority { get; set; }
}
