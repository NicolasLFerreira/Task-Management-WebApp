using Microsoft.AspNetCore.Mvc;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Web.Controllers;

[Route("api/tasks/groups")]
public class TaskItemGroupController : ControllerBase
{
    private readonly IRepository<TaskItemGroup> _repository;

    public TaskItemGroupController(IRepository<TaskItemGroup> repository)
    {
        _repository = repository;
    }

    [HttpGet("{taskItemGroupId:long}")]
    public async Task<ActionResult<TaskItemGroup>> GetById(long taskItemGroupId)
    {
        var result = await _repository.GetByIdAsync(taskItemGroupId);

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskItemGroupDto input)
    {
        var entity = TaskItemGroupMapper.ToEntity(input);

        var result = await _repository.AddAsync(entity);

        return result
            ? Ok()
            : BadRequest("Failed to save entity.");
    }
}
