using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;
using SDP.TaskManagement.Application.Extensions;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;

namespace SDP.TaskManagement.Application.Services;

public class TaskItemService : ITaskItemService
{
    private readonly IRepository<TaskItem> _repository;

    public TaskItemService(IRepository<TaskItem> repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskItemDto>> FilterByProperty(long userId, FilterTaskItemInputDto input)
    {
        var result = await _repository.GetQueryable()
            .Where(e => e.OwnerUserId == userId)
            .WhereIf(input.Title != null, e => e.Title.Contains(input.Title!))
            .WhereIf(input.Description != null, e => e.Description != null && e.Description.Contains(input.Description!))
            .WhereIf(input.Status != null, e => e.ProgressStatus == input.Status)
            .WhereIf(input.Priority != null, e => e.Priority == input.Priority)
            .Select(e => e.ToDto())
            .ToListAsync();

        return result;
    }

    public async Task<List<TaskItemDto>> SearchByTitle(long userId, string titlePattern)
    {
        var result = await _repository.GetQueryable()
            .Where(e => e.OwnerUserId == userId)
            .Where(e => e.Title.Contains(titlePattern))
            .Select(e => e.ToDto())
            .ToListAsync();

        return result;
    }
}
