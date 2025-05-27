using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Dtos;
using SDP.TaskManagement.Domain.Entities;
using System.Security.Claims;

namespace SDP.TaskManagement.Web.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly IRepository<Comment> _commentRepository;
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly IRepository<List> _listRepository;
    private readonly IRepository<Board> _boardRepository;
    private readonly IRepository<BoardMember> _boardMemberRepository;
    private readonly IRepository<User> _userRepository;

    public CommentController(
        IRepository<Comment> commentRepository,
        IRepository<TaskItem> taskRepository,
        IRepository<List> listRepository,
        IRepository<Board> boardRepository,
        IRepository<BoardMember> boardMemberRepository,
        IRepository<User> userRepository)
    {
        _commentRepository = commentRepository;
        _taskRepository = taskRepository;
        _listRepository = listRepository;
        _boardRepository = boardRepository;
        _boardMemberRepository = boardMemberRepository;
        _userRepository = userRepository;
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<List<CommentDto>>> GetTaskComments(long taskId)
    {
        var userId = GetCurrentUserId();
        
        var task = await _taskRepository.GetByIdAsync(taskId);
        
        if (task == null)
            return NotFound($"Task with ID {taskId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var comments = await _commentRepository.GetQueryable()
            .Where(c => c.TaskItemId == taskId)
            .Include(c => c.User)
            .OrderBy(c => c.PostedAt)
            .ToListAsync();
            
        var commentDtos = comments.Select(c => {
            var userName = c.User != null ? $"{c.User.FirstName} {c.User.LastName}" : "Unknown User";
            return new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                UserId = c.UserId,
                UserName = userName,
                TaskItemId = c.TaskItemId,
                CreationDate = c.PostedAt
            };
        }).ToList();
        
        return Ok(commentDtos);
    }

    [HttpGet("{commentId}")]
    public async Task<ActionResult<CommentDto>> GetComment(long commentId)
    {
        var userId = GetCurrentUserId();
        
        var comment = await _commentRepository.GetQueryable()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId);
            
        if (comment == null)
            return NotFound($"Comment with ID {commentId} not found");
            
        var task = await _taskRepository.GetByIdAsync(comment.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {comment.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var user = await _userRepository.GetByIdAsync(comment.UserId);
        var userName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User";
            
        var commentDto = new CommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            UserId = comment.UserId,
            UserName = userName,
            TaskItemId = comment.TaskItemId,
            CreationDate = comment.PostedAt
        };
        
        return Ok(commentDto);
    }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> CreateComment([FromBody] CommentDto commentDto)
    {
        var userId = GetCurrentUserId();
        
        var task = await _taskRepository.GetByIdAsync(commentDto.TaskItemId);
        
        if (task == null)
            return NotFound($"Task with ID {commentDto.TaskItemId} not found");
            
        // Check if user has access to the task
        if (!await HasTaskAccess(userId, task))
            return Forbid("You don't have access to this task");
            
        var comment = new Comment
        {
            Content = commentDto.Content,
            UserId = userId,
            TaskItemId = commentDto.TaskItemId,
            PostedAt = DateTime.UtcNow
        };
        
        var result = await _commentRepository.AddAsync(comment);
        
        if (!result)
            return BadRequest("Failed to create comment");
            
        var user = await _userRepository.GetByIdAsync(userId);
        var userName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User";
        
        commentDto.Id = comment.Id;
        commentDto.UserId = userId;
        commentDto.UserName = userName;
        commentDto.CreationDate = comment.PostedAt;
        
        return CreatedAtAction(nameof(GetComment), new { commentId = comment.Id }, commentDto);
    }

    [HttpPut("{commentId}")]
    public async Task<ActionResult> UpdateComment(long commentId, [FromBody] CommentDto commentDto)
    {
        var userId = GetCurrentUserId();
        
        var comment = await _commentRepository.GetByIdAsync(commentId);
        
        if (comment == null)
            return NotFound($"Comment with ID {commentId} not found");
            
        // Only the comment author can update it
        if (comment.UserId != userId)
            return Forbid("You can only update your own comments");
            
        comment.Content = commentDto.Content;
        
        var result = await _commentRepository.UpdateAsync(comment);
        
        if (!result)
            return BadRequest("Failed to update comment");
            
        return NoContent();
    }

    [HttpDelete("{commentId}")]
    public async Task<ActionResult> DeleteComment(long commentId)
    {
        var userId = GetCurrentUserId();
        
        var comment = await _commentRepository.GetByIdAsync(commentId);
        
        if (comment == null)
            return NotFound($"Comment with ID {commentId} not found");
            
        // Only the comment author can delete it
        if (comment.UserId != userId)
        {
            // Or the task owner
            var task = await _taskRepository.GetByIdAsync(comment.TaskItemId);
            
            if (task == null || task.OwnerUserId != userId)
            {
                // Or the board owner
                var list = await _listRepository.GetByIdAsync(task?.ListId ?? 0);
                
                if (list == null)
                    return Forbid("You don't have permission to delete this comment");
                    
                var board = await _boardRepository.GetByIdAsync(list.BoardId);
                
                if (board == null || board.OwnerId != userId)
                    return Forbid("You don't have permission to delete this comment");
            }
        }
        
        var result = await _commentRepository.DeleteAsync(commentId);
        
        if (!result)
            return BadRequest("Failed to delete comment");
            
        return NoContent();
    }
    
    private async Task<bool> HasBoardAccess(long userId, long boardId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        
        if (board == null)
            return false;
            
        if (board.OwnerId == userId)
            return true;
            
        return await _boardMemberRepository.GetQueryable()
            .AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId);
    }
    
    private async Task<bool> HasTaskAccess(long userId, TaskItem task)
    {
        // Task owner has access
        if (task.OwnerUserId == userId)
            return true;
            
        // Task assignee has access
        if (task.Assignees != null && task.Assignees.Any(a => a.Id == userId))
            return true;
            
        // Board owner or member has access
        var list = await _listRepository.GetByIdAsync(task.ListId);
        
        if (list == null)
            return false;
            
        return await HasBoardAccess(userId, list.BoardId);
    }
    
    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
            
        return long.Parse(userIdClaim.Value);
    }
}
