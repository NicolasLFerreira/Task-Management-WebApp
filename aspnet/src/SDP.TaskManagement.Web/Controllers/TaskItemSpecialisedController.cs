using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Application.Extensions;
using SDP.TaskManagement.Domain.Entities;

using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/tasks/querying/")]
[Authorize]
public class TaskItemSpecialisedController : ControllerBase
{
    private readonly IRepository<TaskItem> _repository;
    private readonly ITaskItemService _taskItemService;

    public TaskItemSpecialisedController(IRepository<TaskItem> repository, ITaskItemService taskItemService)
    {
        _repository = repository;
        _taskItemService = taskItemService;
    }

    [HttpGet("{titlePattern}")]
    public async Task<ActionResult<List<TaskItemDto>>> SearchByTitle(string titlePattern)
    {
        //var result = await _repository.GetQueryable()
        //    .Where(e => e.Title.Contains(titlePattern))
        //    .ToListAsync();

        var userId = GetCurrentUserId();

        var result = await _taskItemService.SearchByTitle(userId, titlePattern);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<List<TaskItemDto>>> FilterByProperty([FromBody] FilterTaskItemInputDto input)
    {
        //var result = await _repository.GetQueryable()
        //    .Where(e => e.OwnerUserId == 1)
        //    .WhereIf(input.Title != null, e => e.Title.Contains(input.Title!))
        //    .WhereIf(input.Description != null, e => e.Description != null && e.Description.Contains(input.Description!))
        //    .WhereIf(input.Status != null, e => e.ProgressStatus == input.Status)
        //    .WhereIf(input.Priority != null, e => e.Priority == input.Priority)
        //    .ToListAsync();

        var userId = GetCurrentUserId();

        var result = await _taskItemService.FilterByProperty(userId, input);

        return Ok(result);
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return long.Parse(userIdClaim.Value);
    }
}
