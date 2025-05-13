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

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Comment> _commentRepository;

    public NotificationService(
        IRepository<Notification> notificationRepository,
        IRepository<TaskItem> taskRepository,
        IRepository<Board> boardRepository,
        IRepository<User> userRepository,
        IRepository<Comment> commentRepository)
    {
        _notificationRepository = notificationRepository;
        _taskRepository = taskRepository;
        _boardRepository = boardRepository;
        _userRepository = userRepository;
        _commentRepository = commentRepository;
    }

    public async Task<NotificationDto> CreateNotificationAsync(NotificationDto notificationDto)
    {
        var notification = new Notification
        {
            Type = (Domain.Entities.NotificationType)(int)notificationDto.Type,
            Content = notificationDto.Content,
            UserId = notificationDto.UserId,
            IsRead = false,
            CreationDate = DateTime.UtcNow,
            EntityType = notificationDto.EntityType,
            EntityId = notificationDto.EntityId,
            ActionLink = notificationDto.ActionLink,
            User = null!
        };
        
        await _notificationRepository.AddAsync(notification);
        return notification.ToDto();
    }
    
    public async Task<NotificationDto> CreateNotificationAsync(long userId, string content, string actionLink, long? relatedEntityId = null, string? relatedEntityType = null)
    {
        var notification = new Notification
        {
            Type = Domain.Entities.NotificationType.System,
            Content = content,
            UserId = userId,
            IsRead = false,
            CreationDate = DateTime.UtcNow,
            EntityType = relatedEntityType,
            EntityId = relatedEntityId,
            ActionLink = actionLink,
            User = null!
        };
        
        await _notificationRepository.AddAsync(notification);
        return notification.ToDto();
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(long userId, bool includeRead = false)
    {
        var query = _notificationRepository.GetQueryable()
            .Where(n => n.UserId == userId);
            
        if (!includeRead)
            query = query.Where(n => !n.IsRead);
            
        var notifications = await query
            .OrderByDescending(n => n.CreationDate)
            .ToListAsync();
            
        return notifications.Select(n => n.ToDto());
    }

    public async Task<bool> MarkNotificationAsReadAsync(long notificationId, long userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId);
        
        if (notification == null || notification.UserId != userId)
            return false;
            
        notification.IsRead = true;
        return await _notificationRepository.UpdateAsync(notification);
    }

    public async Task<bool> MarkAllNotificationsAsReadAsync(long userId)
    {
        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();
            
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            await _notificationRepository.UpdateAsync(notification);
        }
        
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(long notificationId, long userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId);
        
        if (notification == null || notification.UserId != userId)
            return false;
            
        return await _notificationRepository.DeleteAsync(notificationId);
    }

    public async Task<bool> DeleteAllNotificationsAsync(long userId)
    {
        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.UserId == userId)
            .ToListAsync();
            
        foreach (var notification in notifications)
        {
            await _notificationRepository.DeleteAsync(notification.Id);
        }
        
        return true;
    }

    public async Task<NotificationDto> CreateTaskAssignmentNotificationAsync(long taskId, long assignedToUserId, long assignedByUserId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        var assignedBy = await _userRepository.GetByIdAsync(assignedByUserId);
        
        if (task == null || assignedBy == null)
            throw new KeyNotFoundException("Task or user not found");
            
        // Don't notify if user assigned themselves
        if (assignedToUserId == assignedByUserId)
            return null!;
            
        var notification = new Notification
        {
            Type = Domain.Entities.NotificationType.Assignment,
            Content = $"{assignedBy.Username} assigned you to task: {task.Title}",
            UserId = assignedToUserId,
            IsRead = false,
            CreationDate = DateTime.UtcNow,
            EntityType = "TaskItem",
            EntityId = taskId,
            ActionLink = $"/tasks/{taskId}",
            User = null!
        };
        
        await _notificationRepository.AddAsync(notification);
        return notification.ToDto();
    }

    public async Task<NotificationDto> CreateTaskCommentNotificationAsync(long taskId, long commentId, long commentedByUserId, long notifyUserId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        var comment = await _commentRepository.GetByIdAsync(commentId);
        var commentedBy = await _userRepository.GetByIdAsync(commentedByUserId);
        
        if (task == null || comment == null || commentedBy == null)
            throw new KeyNotFoundException("Task, comment, or user not found");
            
        // Don't notify the commenter
        if (notifyUserId == commentedByUserId)
            return null!;
            
        var notification = new Notification
        {
            Type = Domain.Entities.NotificationType.Comment,
            Content = $"{commentedBy.Username} commented on task: {task.Title}",
            UserId = notifyUserId,
            IsRead = false,
            CreationDate = DateTime.UtcNow,
            EntityType = "Comment",
            EntityId = commentId,
            ActionLink = $"/tasks/{taskId}#comment-{commentId}",
            User = null!
        };
        
        await _notificationRepository.AddAsync(notification);
        return notification.ToDto();
    }

    public async Task<NotificationDto> CreateBoardInviteNotificationAsync(long boardId, long invitedUserId, long invitedByUserId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        var invitedBy = await _userRepository.GetByIdAsync(invitedByUserId);
        
        if (board == null || invitedBy == null)
            throw new KeyNotFoundException("Board or user not found");
            
        var notification = new Notification
        {
            Type = Domain.Entities.NotificationType.Invitation,
            Content = $"{invitedBy.Username} invited you to board: {board.Title}",
            UserId = invitedUserId,
            IsRead = false,
            CreationDate = DateTime.UtcNow,
            EntityType = "Board",
            EntityId = boardId,
            ActionLink = $"/boards/{boardId}",
            User = null!
        };
        
        await _notificationRepository.AddAsync(notification);
        return notification.ToDto();
    }
}
