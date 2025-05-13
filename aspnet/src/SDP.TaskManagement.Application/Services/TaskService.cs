using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Application.Mappers;
using SDP.TaskManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SDP.TaskManagement.Application.Services;

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

public class TaskService : ITaskService
{
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IRepository<List> _listRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Label> _labelRepository;
    private readonly INotificationService _notificationService;

    public TaskService(
        IRepository<TaskItem> taskRepository,
        IRepository<List> listRepository,
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository,
        IRepository<User> userRepository,
        IRepository<Label> labelRepository,
        INotificationService notificationService)
    {
        _taskRepository = taskRepository;
        _listRepository = listRepository;
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
        _userRepository = userRepository;
        _labelRepository = labelRepository;
        _notificationService = notificationService;
    }

    public async Task<TaskItemDto> GetTaskAsync(long taskId, long userId)
    {
        if (!await HasAccessToTaskAsync(taskId, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");

        var task = await _taskRepository.GetByIdAsync(taskId);

        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {taskId} not found");
        }
        
        // Get assignees
        var assigneeIds = task.Assignees?.Select(ta => ta.UserId).ToList() ?? new List<long>();
            
        var assigneeUsers = await _userRepository.GetQueryable()
            .Where(u => assigneeIds.Contains(u.Id))
            .ToListAsync();
            
        // Get labels
        var labelIds = task.Labels?.Select(tl => tl.LabelId).ToList() ?? new List<long>();
            
        var taskLabels = await _labelRepository.GetQueryable()
            .Where(l => labelIds.Contains(l.Id))
            .ToListAsync();
            
        // Get owner
        var owner = await _userRepository.GetByIdAsync(task.OwnerUserId);
        
        return TaskItemMapper.ToDto(task);
    }

    public async Task<IEnumerable<TaskItemDto>> GetTasksByListAsync(long listId, long userId)
    {
        var list = await _listRepository.GetByIdAsync(listId);
        
        if (list == null)
            throw new KeyNotFoundException($"List with ID {listId} not found");
            
        if (!await HasAccessToBoardAsync(list.BoardId, userId))
            throw new UnauthorizedAccessException("You don't have access to this list");
            
        var tasks = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == listId)
            .OrderBy(t => t.Position)
            .ToListAsync();
            
        // Get all user IDs
        var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToList();
        
        // Get all assignees
        var taskIds = tasks.Select(t => t.Id).ToList();
        var assignees = tasks.SelectMany(t => t.Assignees ?? Enumerable.Empty<TaskAssignee>()).ToList();
            
        userIds.AddRange(assignees.Select(a => a.UserId).Distinct());
        
        // Get all users
        var users = await _userRepository.GetQueryable()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u);
            
        // Get all labels
        var taskLabels = tasks.SelectMany(t => t.Labels ?? Enumerable.Empty<TaskItemLabel>()).ToList();
            
        var labelIds = taskLabels.Select(tl => tl.LabelId).Distinct().ToList();
        var labels = await _labelRepository.GetQueryable()
            .Where(l => labelIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l);
            
        // Map tasks to DTOs
        return tasks.Select(t => TaskItemMapper.ToDto(t));
    }

    public async Task<IEnumerable<TaskItemDto>> GetTasksByBoardAsync(long boardId, long userId)
    {
        if (!await HasAccessToBoardAsync(boardId, userId))
            throw new UnauthorizedAccessException("You don't have access to this board");
            
        var lists = await _listRepository.GetQueryable()
            .Where(l => l.BoardId == boardId)
            .Select(l => l.Id)
            .ToListAsync();
            
        var tasks = await _taskRepository.GetQueryable()
            .Where(t => lists.Contains(t.ListId))
            .ToListAsync();
            
        // Get all user IDs
        var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToList();
        
        // Get all assignees
        var taskIds = tasks.Select(t => t.Id).ToList();
        var assignees = tasks.SelectMany(t => t.Assignees ?? Enumerable.Empty<TaskAssignee>()).ToList();
            
        userIds.AddRange(assignees.Select(a => a.UserId).Distinct());
        
        // Get all users
        var users = await _userRepository.GetQueryable()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u);
            
        // Get all labels
        var taskLabels = tasks.SelectMany(t => t.Labels ?? Enumerable.Empty<TaskItemLabel>()).ToList();
            
        var labelIds = taskLabels.Select(tl => tl.LabelId).Distinct().ToList();
        var labels = await _labelRepository.GetQueryable()
            .Where(l => labelIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l);
            
        // Map tasks to DTOs
        return tasks.Select(t => TaskItemMapper.ToDto(t));
    }

    public async Task<IEnumerable<TaskItemDto>> GetTasksAssignedToUserAsync(long userId)
    {
        var assignedTaskIds = await _taskRepository.GetQueryable()
            .Where(t => t.Assignees != null && t.Assignees.Any(ta => ta.UserId == userId))
            .Select(t => t.Id)
            .ToListAsync();
            
        var tasks = await _taskRepository.GetQueryable()
            .Where(t => assignedTaskIds.Contains(t.Id) || t.OwnerUserId == userId)
            .ToListAsync();
            
        // Get all user IDs
        var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToList();
        
        // Get all assignees
        var taskIds = tasks.Select(t => t.Id).ToList();
        var assignees = tasks.SelectMany(t => t.Assignees ?? Enumerable.Empty<TaskAssignee>()).ToList();
            
        userIds.AddRange(assignees.Select(a => a.UserId).Distinct());
        
        // Get all users
        var users = await _userRepository.GetQueryable()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u);
            
        // Get all labels
        var taskLabels = tasks.SelectMany(t => t.Labels ?? Enumerable.Empty<TaskItemLabel>()).ToList();
            
        var labelIds = taskLabels.Select(tl => tl.LabelId).Distinct().ToList();
        var labels = await _labelRepository.GetQueryable()
            .Where(l => labelIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l);
            
        // Map tasks to DTOs
        return tasks.Select(t => TaskItemMapper.ToDto(t));
    }

    public async Task<TaskItemDto> CreateTaskAsync(TaskItemDto taskDto, long userId)
    {
        var list = await _listRepository.GetByIdAsync(taskDto.ListId);
        if (list == null)
            throw new KeyNotFoundException($"List with ID {taskDto.ListId} not found");
            
        if (!await HasAccessToBoardAsync(list.BoardId, userId))
            throw new UnauthorizedAccessException("You don't have access to this board");
            
        // Get max position in the list
        var maxPosition = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == taskDto.ListId)
            .Select(t => (int?)t.Position)
            .MaxAsync() ?? 0;
            
        var task = new TaskItem
        {
            Title = taskDto.Title,
            Description = taskDto.Description,
            DueDate = taskDto.DueDate,
            Priority = (Domain.Entities.TaskItemPriority)(int)taskDto.Priority,
            Position = maxPosition + 1,
            ListId = taskDto.ListId,
            OwnerUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreationTime = DateTime.UtcNow,
            LastModifiedTime = DateTime.UtcNow,
            OwnerUser = null!,
            List = null!,
            Assignees = new List<TaskAssignee>(),
            Labels = new List<TaskItemLabel>()
        };
        
        await _taskRepository.AddAsync(task);
        
        // Add assignees
        if (taskDto.Assignees != null && taskDto.Assignees.Any())
        {
            foreach (var assigneeDto in taskDto.Assignees)
            {
                var assignee = new TaskAssignee
                {
                    TaskItemId = task.Id,
                    UserId = assigneeDto.Id,
                    User = null!,
                    TaskItem = task
                };
                
                task.Assignees.Add(assignee);
                
                // Create notification for assignee
                await _notificationService.CreateNotificationAsync(
                    assigneeDto.Id, 
                    $"You have been assigned to task: {task.Title}", 
                    $"/tasks/{task.Id}");
            }
        }
        
        // Add labels
        if (taskDto.Labels != null && taskDto.Labels.Any())
        {
            foreach (var labelDto in taskDto.Labels)
            {
                var taskLabel = new TaskItemLabel
                {
                    TaskItemId = task.Id,
                    LabelId = labelDto.Id,
                    Label = null!,
                    TaskItem = task
                };
                
                task.Labels.Add(taskLabel);
            }
        }
        
        await _taskRepository.UpdateAsync(task);
        
        // Get the created task with all relationships
        return await GetTaskAsync(task.Id, userId);
    }

    public async Task<TaskItemDto> UpdateTaskAsync(TaskItemDto taskDto, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskDto.Id);
        if (task == null)
            throw new KeyNotFoundException($"Task with ID {taskDto.Id} not found");
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        // Update basic properties
        task.Title = taskDto.Title;
        task.Description = taskDto.Description;
        task.DueDate = taskDto.DueDate;
        task.Priority = (Domain.Entities.TaskItemPriority)(int)taskDto.Priority;
        task.UpdatedAt = DateTime.UtcNow;
        task.LastModifiedTime = DateTime.UtcNow;
        
        // Update list if changed
        if (task.ListId != taskDto.ListId)
        {
            var list = await _listRepository.GetByIdAsync(taskDto.ListId);
            if (list == null)
                throw new KeyNotFoundException($"List with ID {taskDto.ListId} not found");
                
            if (!await HasAccessToBoardAsync(list.BoardId, userId))
                throw new UnauthorizedAccessException("You don't have access to the target list");
                
            task.ListId = taskDto.ListId;
            
            // Get max position in the new list
            var maxPosition = await _taskRepository.GetQueryable()
                .Where(t => t.ListId == taskDto.ListId)
                .Select(t => (int?)t.Position)
                .MaxAsync() ?? 0;
                
            task.Position = maxPosition + 1;
        }
        
        // Update assignees
        var currentAssignees = task.Assignees?.ToList() ?? new List<TaskAssignee>();
            
        var currentAssigneeIds = currentAssignees.Select(a => a.UserId).ToList();
        var newAssigneeIds = taskDto.Assignees?.Select(a => a.Id).ToList() ?? new List<long>();
        
        // Remove assignees that are not in the new list
        var assigneesToRemove = currentAssignees
            .Where(a => !newAssigneeIds.Contains(a.UserId))
            .ToList();
            
        foreach (var assignee in assigneesToRemove)
        {
            task.Assignees?.Remove(assignee);
        }
        
        // Add new assignees
        var assigneesToAdd = newAssigneeIds
            .Where(id => !currentAssigneeIds.Contains(id))
            .ToList();
            
        foreach (var assigneeId in assigneesToAdd)
        {
            var assignee = new TaskAssignee
            {
                TaskItemId = task.Id,
                UserId = assigneeId,
                User = null!,
                TaskItem = task
            };
            
            task.Assignees?.Add(assignee);
            
            // Create notification for new assignee
            await _notificationService.CreateNotificationAsync(
                assigneeId,
                $"You have been assigned to task: {task.Title}",
                $"/tasks/{task.Id}");
        }
        
        // Update labels
        var currentLabels = task.Labels?.ToList() ?? new List<TaskItemLabel>();
            
        var currentLabelIds = currentLabels.Select(l => l.LabelId).ToList();
        var newLabelIds = taskDto.Labels?.Select(l => l.Id).ToList() ?? new List<long>();
        
        // Remove labels that are not in the new list
        var labelsToRemove = currentLabels
            .Where(l => !newLabelIds.Contains(l.LabelId))
            .ToList();
            
        foreach (var label in labelsToRemove)
        {
            task.Labels?.Remove(label);
        }
        
        // Add new labels
        var labelsToAdd = newLabelIds
            .Where(id => !currentLabelIds.Contains(id))
            .ToList();
            
        foreach (var labelId in labelsToAdd)
        {
            var taskLabel = new TaskItemLabel
            {
                TaskItemId = task.Id,
                LabelId = labelId,
                Label = null!,
                TaskItem = task
            };
            
            task.Labels?.Add(taskLabel);
        }
        
        await _taskRepository.UpdateAsync(task);
        
        // Get the updated task with all relationships
        return await GetTaskAsync(task.Id, userId);
    }

    public async Task<bool> DeleteTaskAsync(long taskId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        // Delete assignees
        var assignees = task.Assignees?.ToList() ?? new List<TaskAssignee>();
            
        foreach (var assignee in assignees)
        {
            task.Assignees?.Remove(assignee);
        }
        
        // Delete labels
        var labels = task.Labels?.ToList() ?? new List<TaskItemLabel>();
            
        foreach (var label in labels)
        {
            task.Labels?.Remove(label);
        }
        
        await _taskRepository.UpdateAsync(task);
        
        // Delete task
        await _taskRepository.DeleteAsync(taskId);
        
        return true;
    }

    public async Task<bool> MoveTaskToListAsync(long taskId, long listId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        var list = await _listRepository.GetByIdAsync(listId);
        if (list == null)
            return false;
            
        if (!await HasAccessToBoardAsync(list.BoardId, userId))
            throw new UnauthorizedAccessException("You don't have access to the target list");
            
        // Get max position in the new list
        var maxPosition = await _taskRepository.GetQueryable()
            .Where(t => t.ListId == listId)
            .Select(t => (int?)t.Position)
            .MaxAsync() ?? 0;
            
        task.ListId = listId;
        task.Position = maxPosition + 1;
        task.UpdatedAt = DateTime.UtcNow;
        task.LastModifiedTime = DateTime.UtcNow;
        
        await _taskRepository.UpdateAsync(task);
        
        return true;
    }

    public async Task<bool> AssignUserToTaskAsync(long taskId, long assigneeId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        var user = await _userRepository.GetByIdAsync(assigneeId);
        if (user == null)
            return false;
            
        // Check if user is already assigned
        var existingAssignment = task.Assignees?.FirstOrDefault(ta => ta.UserId == assigneeId);
            
        if (existingAssignment != null)
            return true; // Already assigned
            
        var assignee = new TaskAssignee
        {
            TaskItemId = taskId,
            UserId = assigneeId,
            User = null!,
            TaskItem = task
        };
        
        task.Assignees?.Add(assignee);
        await _taskRepository.UpdateAsync(task);
        
        // Create notification for assignee
        await _notificationService.CreateNotificationAsync(
            assigneeId,
            $"You have been assigned to task: {task.Title}",
            $"/tasks/{task.Id}");
            
        return true;
    }

    public async Task<bool> RemoveUserFromTaskAsync(long taskId, long assigneeId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        var assignment = task.Assignees?.FirstOrDefault(ta => ta.UserId == assigneeId);
            
        if (assignment == null)
            return true; // Not assigned
            
        task.Assignees?.Remove(assignment);
        await _taskRepository.UpdateAsync(task);
        
        return true;
    }

    public async Task<bool> AddLabelToTaskAsync(long taskId, long labelId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        var label = await _labelRepository.GetByIdAsync(labelId);
        if (label == null)
            return false;
            
        // Check if label is already added
        var existingLabel = task.Labels?.FirstOrDefault(tl => tl.LabelId == labelId);
            
        if (existingLabel != null)
            return true; // Already added
            
        var taskLabel = new TaskItemLabel
        {
            TaskItemId = taskId,
            LabelId = labelId,
            Label = null!,
            TaskItem = task
        };
        
        task.Labels?.Add(taskLabel);
        await _taskRepository.UpdateAsync(task);
        
        return true;
    }

    public async Task<bool> RemoveLabelFromTaskAsync(long taskId, long labelId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        if (!await HasAccessToTaskAsync(task.Id, userId))
            throw new UnauthorizedAccessException("You don't have access to this task");
            
        var taskLabel = task.Labels?.FirstOrDefault(tl => tl.LabelId == labelId);
            
        if (taskLabel == null)
            return true; // Not added
            
        task.Labels?.Remove(taskLabel);
        await _taskRepository.UpdateAsync(task);
        
        return true;
    }

    public async Task<bool> HasAccessToTaskAsync(long taskId, long userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            return false;
            
        // Task owner has access
        if (task.OwnerUserId == userId)
            return true;
            
        // Check if user is assigned to the task
        var isAssigned = task.Assignees?.Any(ta => ta.UserId == userId) ?? false;
            
        if (isAssigned)
            return true;
            
        // Check if user is a member of the board
        var list = await _listRepository.GetByIdAsync(task.ListId);
        if (list == null)
            return false;
            
        return await HasAccessToBoardAsync(list.BoardId, userId);
    }

    private async Task<bool> HasAccessToBoardAsync(long boardId, long userId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        if (board == null)
            return false;
            
        // Board owner has access
        if (board.OwnerId == userId)
            return true;
            
        // Check if user is a member of the board
        var isMember = await _boardMemberRepository.GetQueryable()
            .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId);
            
        return isMember;
    }
}
