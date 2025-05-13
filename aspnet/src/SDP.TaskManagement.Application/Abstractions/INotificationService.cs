using SDP.TaskManagement.Application.Dtos;

namespace SDP.TaskManagement.Application.Abstractions;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(NotificationDto notificationDto);
    Task<NotificationDto> CreateNotificationAsync(long userId, string content, string actionLink, long? relatedEntityId = null, string? relatedEntityType = null);
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(long userId, bool includeRead = false);
    Task<bool> MarkNotificationAsReadAsync(long notificationId, long userId);
    Task<bool> MarkAllNotificationsAsReadAsync(long userId);
    Task<bool> DeleteNotificationAsync(long notificationId, long userId);
    Task<bool> DeleteAllNotificationsAsync(long userId);
    Task<NotificationDto> CreateTaskAssignmentNotificationAsync(long taskId, long assignedToUserId, long assignedByUserId);
    Task<NotificationDto> CreateTaskCommentNotificationAsync(long taskId, long commentId, long commentedByUserId, long notifyUserId);
    Task<NotificationDto> CreateBoardInviteNotificationAsync(long boardId, long invitedUserId, long invitedByUserId);
}
