using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Dtos.AssistanceDtos;

namespace SDP.TaskManagement.Application.Abstractions;

public interface ITaskItemService
{
    public Task<List<TaskItemDto>> SearchByTitle(long userId, string titlePattern);
    public Task<List<TaskItemDto>> FilterByProperty(long userId, FilterTaskItemInputDto input);
}
