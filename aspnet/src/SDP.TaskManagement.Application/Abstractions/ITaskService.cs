using SDP.TaskManagement.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SDP.TaskManagement.Application.Abstractions;

public interface ITaskService
{
    Task<TaskItemDto> GetTaskAsync(long taskId, long userId);
    Task<IEnumerable<TaskItemDto>> GetTasksByListAsync(long listId, long userId);
    Task<IEnumerable<TaskItemDto>> GetTasksByBoardAsync(long boardId, long userId);
    Task<IEnumerable<TaskItemDto>> GetTasksAssignedToUserAsync(long userId);
    Task<TaskItemDto> CreateTaskAsync(TaskItemDto taskDto, long userId);
    Task<TaskItemDto> UpdateTaskAsync(TaskItemDto taskDto, long userId);
    Task<bool> DeleteTaskAsync(long taskId, long userId);
    Task<bool> MoveTaskToListAsync(long taskId, long listId, long userId);
    Task<bool> AssignUserToTaskAsync(long taskId, long assigneeId, long userId);
    Task<bool> RemoveUserFromTaskAsync(long taskId, long assigneeId, long userId);
    Task<bool> AddLabelToTaskAsync(long taskId, long labelId, long userId);
    Task<bool> RemoveLabelFromTaskAsync(long taskId, long labelId, long userId);
    Task<bool> HasAccessToTaskAsync(long taskId, long userId);
}
