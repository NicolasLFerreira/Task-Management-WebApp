using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly IRepository<Notification> _notificationRepository;

    public NotificationController(IRepository<Notification> notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetUserNotifications()
    {
        var userId = GetCurrentUserId();

        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        var notificationDtos = notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Type = (NotificationType)(int)n.Type,
            Content = n.Content,
            UserId = n.UserId,
            IsRead = n.IsRead,
            CreationDate = n.CreatedAt
        }).ToList();

        return Ok(notificationDtos);
    }

    [HttpGet("unread")]
    public async Task<ActionResult<List<NotificationDto>>> GetUnreadNotifications()
    {
        var userId = GetCurrentUserId();

        var notifications = await _notificationRepository.GetQueryable()
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        var notificationDtos = notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Type = (NotificationType)(int)n.Type,
            Content = n.Content,
            UserId = n.UserId,
            IsRead = n.IsRead,
            CreationDate = n.CreatedAt
        }).ToList();

        return Ok(notificationDtos);
    }

    [HttpPost("{notificationId}/read")]
    public async Task<ActionResult> MarkAsRead(long notificationId)
    {
        var userId = GetCurrentUserId();

        var notification = await _notificationRepository.GetByIdAsync(notificationId);

        if (notification == null)
            return NotFound($"Notification with ID {notificationId} not found");

        // Check if notification belongs to the user
        if (notification.UserId != userId)
            return Forbid("You don't have access to this notification");

        notification.IsRead = true;

        var result = await _notificationRepository.UpdateAsync(notification);

        if (!result)
            return BadRequest("Failed to mark notification as read");

        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();

        var unreadNotifications = await _notificationRepository.GetQueryable()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            await _notificationRepository.UpdateAsync(notification);
        }

        return NoContent();
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return long.Parse(userIdClaim.Value);
    }
}
