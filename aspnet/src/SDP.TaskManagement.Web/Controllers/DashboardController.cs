using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Domain.Entities;

using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;

    public DashboardController(
        IRepository<TaskItem> taskRepository,
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository)
    {
        _taskRepository = taskRepository;
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var userId = GetCurrentUserId();

        // Get user's boards
        var ownedBoardIds = await _boardRepository.GetQueryable()
            .Where(b => b.OwnerId == userId)
            .Select(b => b.Id)
            .ToListAsync();

        var memberBoardIds = await _boardMemberRepository.GetQueryable()
            .Where(bm => bm.UserId == userId)
            .Select(bm => bm.BoardId)
            .ToListAsync();

        var allBoardIds = ownedBoardIds.Concat(memberBoardIds).Distinct().ToList();

        // Get tasks from user's boards
        var tasks = await _taskRepository.GetQueryable()
            .Where(t => t.OwnerUserId == userId || t.Assignees.Any(a => a.Id == userId))
            .ToListAsync();

        // Calculate stats
        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.ProgressStatus == TaskItemStatus.Completed);
        var inProgressTasks = tasks.Count(t => t.ProgressStatus == TaskItemStatus.InProgress);
        var todoTasks = tasks.Count(t => t.ProgressStatus == TaskItemStatus.Todo);

        var overdueTasks = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.ProgressStatus != TaskItemStatus.Completed);
        var dueSoonTasks = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value >= DateTime.UtcNow && t.DueDate.Value <= DateTime.UtcNow.AddDays(3) && t.ProgressStatus != TaskItemStatus.Completed);

        var highPriorityTasks = tasks.Count(t => t.Priority == TaskItemPriority.High && t.ProgressStatus != TaskItemStatus.Completed);

        var stats = new DashboardStatsDto
        {
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            InProgressTasks = inProgressTasks,
            TodoTasks = todoTasks,
            OverdueTasks = overdueTasks,
            DueSoonTasks = dueSoonTasks,
            HighPriorityTasks = highPriorityTasks,
            CompletionRate = totalTasks > 0 ? (double)completedTasks / totalTasks : 0,
            TotalBoards = allBoardIds.Count
        };

        return Ok(stats);
    }

    [HttpGet("recent-activity")]
    public async Task<ActionResult<List<RecentActivityDto>>> GetRecentActivity()
    {
        var userId = GetCurrentUserId();

        // Get recently updated tasks
        var recentTasks = await _taskRepository.GetQueryable()
            .Where(t => t.OwnerUserId == userId || t.Assignees.Any(a => a.Id == userId))
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .ToListAsync();

        var activities = recentTasks.Select(t => new RecentActivityDto
        {
            Id = t.Id,
            Type = "Task",
            Title = t.Title,
            Date = t.CreatedAt,
            Status = t.ProgressStatus.ToString()
        }).ToList();

        return Ok(activities);
    }

    [HttpGet("upcoming-tasks")]
    public async Task<ActionResult<List<UpcomingTaskDto>>> GetUpcomingTasks()
    {
        var userId = GetCurrentUserId();

        // Get upcoming tasks (due in the next 7 days)
        var upcomingTasks = await _taskRepository.GetQueryable()
            .Where(t => ( t.OwnerUserId == userId || t.Assignees.Any(a => a.Id == userId) ) &&
                        t.DueDate.HasValue &&
                        t.DueDate.Value >= DateTime.UtcNow &&
                        t.DueDate.Value <= DateTime.UtcNow.AddDays(7) &&
                        t.ProgressStatus != TaskItemStatus.Completed)
            .OrderBy(t => t.DueDate)
            .ToListAsync();

        var upcomingTaskDtos = upcomingTasks.Select(t => new UpcomingTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            DueDate = t.DueDate ?? DateTime.MaxValue,
            Priority = t.Priority.ToString(),
            Status = t.ProgressStatus.ToString()
        }).ToList();

        return Ok(upcomingTaskDtos);
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return long.Parse(userIdClaim.Value);
    }
}

public class DashboardStatsDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int TodoTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int DueSoonTasks { get; set; }
    public int HighPriorityTasks { get; set; }
    public double CompletionRate { get; set; }
    public int TotalBoards { get; set; }
}

public class RecentActivityDto
{
    public long Id { get; set; }
    public required string Type { get; set; }
    public required string Title { get; set; }
    public DateTime Date { get; set; }
    public required string Status { get; set; }
}

public class UpcomingTaskDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public DateTime DueDate { get; set; }
    public required string Priority { get; set; }
    public required string Status { get; set; }
}
